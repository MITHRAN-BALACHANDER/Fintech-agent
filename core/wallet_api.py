"""
Wallet API Endpoints
Provides REST API for wallet connection, authentication, and management
"""
from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

from core.database import get_session
from core.wallet_service import WalletService
from core.wallet_auth import WalletAuthService, WalletJWT, checksum_address


# API Router
router = APIRouter(prefix="/api/wallet", tags=["Wallet"])


# Request/Response Models
class NonceRequest(BaseModel):
    """Request for wallet signature nonce"""
    wallet_address: str = Field(..., description="EVM wallet address")


class NonceResponse(BaseModel):
    """Response with nonce and message to sign"""
    wallet_address: str
    nonce: str
    message: str
    expires_at: datetime


class VerifySignatureRequest(BaseModel):
    """Request to verify wallet signature"""
    wallet_address: str = Field(..., description="EVM wallet address")
    signature: str = Field(..., description="Hex signature from wallet")
    nonce: str = Field(..., description="Nonce that was signed")
    chain_id: int = Field(default=1, description="Blockchain chain ID")
    wallet_type: str = Field(default="metamask", description="metamask, coinbase, walletconnect")
    label: Optional[str] = Field(None, description="User-defined wallet label")


class WalletConnectionResponse(BaseModel):
    """Response with wallet connection details"""
    id: str
    wallet_address: str
    chain_id: int
    wallet_type: str
    label: Optional[str]
    is_primary: bool
    verified_at: Optional[datetime]
    created_at: datetime


class ConnectWalletResponse(BaseModel):
    """Response after successful wallet connection"""
    wallet: WalletConnectionResponse
    auth: WalletJWT


class SetPrimaryRequest(BaseModel):
    """Request to set primary wallet"""
    wallet_id: str


# Helper function to extract tenant and user from headers
def get_tenant_user(
    x_tenant_id: str = Header(..., alias="X-Tenant-ID"),
    x_user_id: str = Header(..., alias="X-User-ID")
) -> tuple[str, str]:
    """Extract tenant_id and user_id from headers"""
    return x_tenant_id, x_user_id


@router.post("/nonce", response_model=NonceResponse)
async def request_nonce(request: NonceRequest):
    """
    Request a nonce for wallet signature (Step 1 of SIWE flow).
    
    This endpoint is public - no authentication required.
    Frontend calls this before prompting user to sign.
    """
    try:
        # Validate and checksum address
        checksummed = checksum_address(request.wallet_address)
        
        # Get or create nonce
        session = get_session()
        try:
            nonce_data = WalletService.create_or_get_nonce(session, checksummed)
            
            return NonceResponse(
                wallet_address=nonce_data.wallet_address,
                nonce=nonce_data.nonce,
                message=nonce_data.message,
                expires_at=nonce_data.expires_at
            )
        finally:
            session.close()
            
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate nonce: {str(e)}")


@router.post("/verify", response_model=ConnectWalletResponse)
async def verify_and_connect(
    request: VerifySignatureRequest,
    tenant_user: tuple[str, str] = Depends(get_tenant_user)
):
    """
    Verify wallet signature and create/update wallet connection (Step 2 of SIWE flow).
    
    Requires X-Tenant-ID and X-User-ID headers (from main app authentication).
    On success, returns wallet connection + wallet-scoped JWT.
    """
    tenant_id, user_id = tenant_user
    
    try:
        session = get_session()
        try:
            # Verify signature and connect wallet
            wallet_conn = WalletService.verify_and_connect_wallet(
                session=session,
                tenant_id=tenant_id,
                user_id=user_id,
                wallet_address=request.wallet_address,
                signature=request.signature,
                nonce=request.nonce,
                chain_id=request.chain_id,
                wallet_type=request.wallet_type,
                label=request.label
            )
            
            if not wallet_conn:
                raise HTTPException(status_code=401, detail="Signature verification failed")
            
            # Generate wallet-scoped JWT
            jwt_token = WalletAuthService.generate_wallet_jwt(
                tenant_id=wallet_conn.tenant_id,
                user_id=wallet_conn.user_id,
                wallet_id=wallet_conn.id,
                wallet_address=wallet_conn.wallet_address,
                chain_id=wallet_conn.chain_id
            )
            
            return ConnectWalletResponse(
                wallet=WalletConnectionResponse(
                    id=wallet_conn.id,
                    wallet_address=wallet_conn.wallet_address,
                    chain_id=wallet_conn.chain_id,
                    wallet_type=wallet_conn.wallet_type,
                    label=wallet_conn.label,
                    is_primary=wallet_conn.is_primary,
                    verified_at=wallet_conn.verified_at,
                    created_at=wallet_conn.created_at
                ),
                auth=jwt_token
            )
            
        finally:
            session.close()
            
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to connect wallet: {str(e)}")


@router.get("/connections", response_model=List[WalletConnectionResponse])
async def list_wallets(tenant_user: tuple[str, str] = Depends(get_tenant_user)):
    """
    List all wallet connections for the authenticated user.
    
    Requires X-Tenant-ID and X-User-ID headers.
    """
    tenant_id, user_id = tenant_user
    
    try:
        session = get_session()
        try:
            wallets = WalletService.get_user_wallets(session, tenant_id, user_id)
            
            return [
                WalletConnectionResponse(
                    id=w.id,
                    wallet_address=w.wallet_address,
                    chain_id=w.chain_id,
                    wallet_type=w.wallet_type,
                    label=w.label,
                    is_primary=w.is_primary,
                    verified_at=w.verified_at,
                    created_at=w.created_at
                )
                for w in wallets
            ]
        finally:
            session.close()
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list wallets: {str(e)}")


@router.post("/set-primary")
async def set_primary_wallet(
    request: SetPrimaryRequest,
    tenant_user: tuple[str, str] = Depends(get_tenant_user)
):
    """
    Set a wallet as the primary wallet.
    
    Requires X-Tenant-ID and X-User-ID headers.
    """
    tenant_id, user_id = tenant_user
    
    try:
        session = get_session()
        try:
            success = WalletService.set_primary_wallet(
                session, tenant_id, user_id, request.wallet_id
            )
            
            if not success:
                raise HTTPException(status_code=404, detail="Wallet not found")
            
            return {"success": True, "message": "Primary wallet updated"}
            
        finally:
            session.close()
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to set primary wallet: {str(e)}")


@router.delete("/connections/{wallet_id}")
async def disconnect_wallet(
    wallet_id: str,
    tenant_user: tuple[str, str] = Depends(get_tenant_user)
):
    """
    Disconnect (delete) a wallet connection.
    
    Requires X-Tenant-ID and X-User-ID headers.
    """
    tenant_id, user_id = tenant_user
    
    try:
        session = get_session()
        try:
            success = WalletService.disconnect_wallet(
                session, tenant_id, user_id, wallet_id
            )
            
            if not success:
                raise HTTPException(status_code=404, detail="Wallet not found")
            
            return {"success": True, "message": "Wallet disconnected"}
            
        finally:
            session.close()
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to disconnect wallet: {str(e)}")
