"""
Crypto Wallet Authentication & Integration
Implements Sign-In With Ethereum (SIWE) for self-custody wallet connections
"""
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from eth_account.messages import encode_defunct
from eth_account import Account
from web3 import Web3
import secrets
import jwt
import os
from pydantic import BaseModel, Field


class WalletAuthConfig:
    """Configuration for wallet authentication"""
    JWT_SECRET = os.getenv("JWT_SECRET", secrets.token_urlsafe(32))
    JWT_ALGORITHM = "HS256"
    JWT_EXPIRY_HOURS = 24
    NONCE_EXPIRY_MINUTES = 5
    SIWE_DOMAIN = os.getenv("SIWE_DOMAIN", "finsight.app")
    SIWE_URI = os.getenv("SIWE_URI", "https://finsight.app")


class WalletNonce(BaseModel):
    """Nonce for wallet signature request"""
    wallet_address: str
    nonce: str
    expires_at: datetime
    message: str


class WalletSignatureVerification(BaseModel):
    """Wallet signature verification request"""
    wallet_address: str
    signature: str
    nonce: str
    chain_id: int = 1


class WalletConnection(BaseModel):
    """Wallet connection model"""
    id: str = Field(default_factory=lambda: f"wallet_{datetime.now().timestamp()}")
    tenant_id: str
    user_id: str
    wallet_address: str
    chain_id: int = 1
    wallet_type: str  # metamask, coinbase, walletconnect
    label: Optional[str] = None
    is_primary: bool = False
    verified_at: Optional[datetime] = None
    last_used_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.now)
    metadata: Dict[str, Any] = Field(default_factory=dict)


class WalletJWT(BaseModel):
    """JWT token for wallet-authenticated requests"""
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    wallet_address: str
    tenant_id: str
    user_id: str
    wallet_id: str


class WalletAuthService:
    """Service for wallet authentication using SIWE"""
    
    @staticmethod
    def generate_nonce(wallet_address: str) -> WalletNonce:
        """
        Generate a nonce for wallet signature request.
        
        Args:
            wallet_address: EVM wallet address (checksummed)
            
        Returns:
            WalletNonce with message to sign
        """
        # Checksum the address
        checksummed_address = Web3.to_checksum_address(wallet_address)
        
        # Generate random nonce
        nonce = secrets.token_urlsafe(32)
        
        # Create expiry
        expires_at = datetime.now() + timedelta(minutes=WalletAuthConfig.NONCE_EXPIRY_MINUTES)
        
        # Create SIWE-compliant message
        message = WalletAuthService._create_siwe_message(
            address=checksummed_address,
            nonce=nonce,
            issued_at=datetime.now().isoformat()
        )
        
        return WalletNonce(
            wallet_address=checksummed_address,
            nonce=nonce,
            expires_at=expires_at,
            message=message
        )
    
    @staticmethod
    def _create_siwe_message(address: str, nonce: str, issued_at: str) -> str:
        """
        Create Sign-In With Ethereum (EIP-4361) compliant message.
        
        Args:
            address: Checksummed EVM address
            nonce: Random nonce
            issued_at: ISO format timestamp
            
        Returns:
            SIWE message string
        """
        return f"""{WalletAuthConfig.SIWE_DOMAIN} wants you to sign in with your Ethereum account:
{address}

Connect your wallet to FinSIght Platform for secure, self-custody portfolio tracking.

URI: {WalletAuthConfig.SIWE_URI}
Version: 1
Chain ID: 1
Nonce: {nonce}
Issued At: {issued_at}"""
    
    @staticmethod
    def verify_signature(
        wallet_address: str,
        signature: str,
        nonce: str,
        message: str
    ) -> bool:
        """
        Verify wallet signature using eth_account.
        
        Args:
            wallet_address: Expected wallet address
            signature: Hex signature from wallet
            nonce: Nonce that was signed
            message: Original message that was signed
            
        Returns:
            True if signature is valid
        """
        try:
            # Checksum address
            checksummed_address = Web3.to_checksum_address(wallet_address)
            
            # Encode message for Ethereum signed message standard
            encoded_message = encode_defunct(text=message)
            
            # Recover address from signature
            recovered_address = Account.recover_message(
                encoded_message,
                signature=signature
            )
            
            # Verify recovered address matches expected address
            return recovered_address.lower() == checksummed_address.lower()
            
        except Exception as e:
            print(f"Signature verification failed: {e}")
            return False
    
    @staticmethod
    def generate_wallet_jwt(
        tenant_id: str,
        user_id: str,
        wallet_id: str,
        wallet_address: str,
        chain_id: int = 1
    ) -> WalletJWT:
        """
        Generate JWT token for wallet-authenticated requests.
        
        Args:
            tenant_id: Tenant identifier
            user_id: User identifier
            wallet_id: Wallet connection ID
            wallet_address: Checksummed wallet address
            chain_id: Blockchain chain ID
            
        Returns:
            WalletJWT with access token
        """
        expires_at = datetime.now() + timedelta(hours=WalletAuthConfig.JWT_EXPIRY_HOURS)
        
        payload = {
            "tenant_id": tenant_id,
            "user_id": user_id,
            "wallet_id": wallet_id,
            "wallet_address": wallet_address,
            "chain_id": chain_id,
            "exp": expires_at.timestamp(),
            "iat": datetime.now().timestamp(),
            "type": "wallet"
        }
        
        token = jwt.encode(
            payload,
            WalletAuthConfig.JWT_SECRET,
            algorithm=WalletAuthConfig.JWT_ALGORITHM
        )
        
        return WalletJWT(
            access_token=token,
            expires_in=WalletAuthConfig.JWT_EXPIRY_HOURS * 3600,
            wallet_address=wallet_address,
            tenant_id=tenant_id,
            user_id=user_id,
            wallet_id=wallet_id
        )
    
    @staticmethod
    def verify_wallet_jwt(token: str) -> Optional[Dict[str, Any]]:
        """
        Verify and decode wallet JWT token.
        
        Args:
            token: JWT token string
            
        Returns:
            Decoded payload if valid, None otherwise
        """
        try:
            payload = jwt.decode(
                token,
                WalletAuthConfig.JWT_SECRET,
                algorithms=[WalletAuthConfig.JWT_ALGORITHM]
            )
            
            # Verify it's a wallet token
            if payload.get("type") != "wallet":
                return None
            
            return payload
            
        except jwt.ExpiredSignatureError:
            print("JWT token expired")
            return None
        except jwt.InvalidTokenError as e:
            print(f"Invalid JWT token: {e}")
            return None


def checksum_address(address: str) -> str:
    """
    Convert address to checksummed format.
    
    Args:
        address: Ethereum address
        
    Returns:
        Checksummed address
    """
    try:
        return Web3.to_checksum_address(address)
    except Exception:
        raise ValueError(f"Invalid Ethereum address: {address}")
