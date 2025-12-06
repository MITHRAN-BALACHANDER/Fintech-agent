"""
Wallet Management Service
Handles wallet connection CRUD operations with multi-tenant isolation
"""
from datetime import datetime
from typing import List, Optional
from sqlalchemy.orm import Session
from core.database import WalletConnectionDB, WalletNonceDB, UserDB
from core.wallet_auth import (
    WalletConnection,
    WalletNonce,
    WalletAuthService,
    checksum_address
)


class WalletService:
    """Service for managing wallet connections"""
    
    @staticmethod
    def create_or_get_nonce(
        session: Session,
        wallet_address: str
    ) -> WalletNonce:
        """
        Create or retrieve a nonce for wallet signature.
        
        Args:
            session: Database session
            wallet_address: EVM wallet address
            
        Returns:
            WalletNonce with message to sign
        """
        # Checksum address
        checksummed = checksum_address(wallet_address)
        
        # Check if nonce exists and is not expired/used
        existing_nonce = session.query(WalletNonceDB).filter_by(
            wallet_address=checksummed
        ).first()
        
        # Delete old/used nonces
        if existing_nonce:
            if existing_nonce.used or existing_nonce.expires_at < datetime.now():
                session.delete(existing_nonce)
                session.commit()
                existing_nonce = None
        
        # Generate new nonce if needed
        if not existing_nonce:
            nonce_data = WalletAuthService.generate_nonce(checksummed)
            
            db_nonce = WalletNonceDB(
                wallet_address=nonce_data.wallet_address,
                nonce=nonce_data.nonce,
                message=nonce_data.message,  # Store the full message
                expires_at=nonce_data.expires_at,
                used=False
            )
            session.add(db_nonce)
            session.commit()
            
            return nonce_data
        
        # Return existing nonce with stored message
        return WalletNonce(
            wallet_address=existing_nonce.wallet_address,
            nonce=existing_nonce.nonce,
            expires_at=existing_nonce.expires_at,
            message=existing_nonce.message  # Use stored message
        )
    
    @staticmethod
    def verify_and_connect_wallet(
        session: Session,
        tenant_id: str,
        user_id: str,
        wallet_address: str,
        signature: str,
        nonce: str,
        chain_id: int = 1,
        wallet_type: str = "metamask",
        label: Optional[str] = None
    ) -> Optional[WalletConnection]:
        """
        Verify signature and create/update wallet connection.
        
        Args:
            session: Database session
            tenant_id: Tenant identifier
            user_id: User identifier
            wallet_address: EVM wallet address
            signature: Hex signature from wallet
            nonce: Nonce that was signed
            chain_id: Blockchain chain ID
            wallet_type: Type of wallet (metamask, coinbase, walletconnect)
            label: Optional user-defined label
            
        Returns:
            WalletConnection if successful, None otherwise
        """
        # Checksum address
        checksummed = checksum_address(wallet_address)
        
        # Verify user exists and belongs to tenant
        user = session.query(UserDB).filter_by(
            id=user_id,
            tenant_id=tenant_id
        ).first()
        
        if not user:
            raise ValueError(f"User {user_id} not found in tenant {tenant_id}")
        
        # Get nonce from database
        db_nonce = session.query(WalletNonceDB).filter_by(
            wallet_address=checksummed,
            nonce=nonce
        ).first()
        
        if not db_nonce:
            raise ValueError("Nonce not found")
        
        if db_nonce.used:
            raise ValueError("Nonce already used")
        
        if db_nonce.expires_at < datetime.now():
            raise ValueError("Nonce expired")
        
        # Use stored message (exact same message that was signed)
        message = db_nonce.message
        
        # Verify signature
        is_valid = WalletAuthService.verify_signature(
            wallet_address=checksummed,
            signature=signature,
            nonce=nonce,
            message=message
        )
        
        if not is_valid:
            raise ValueError("Invalid signature")
        
        # Mark nonce as used
        db_nonce.used = True
        session.commit()
        
        # Check if wallet already connected
        existing = session.query(WalletConnectionDB).filter_by(
            tenant_id=tenant_id,
            user_id=user_id,
            wallet_address=checksummed,
            chain_id=chain_id
        ).first()
        
        now = datetime.now()
        
        if existing:
            # Update existing connection
            existing.verified_at = now
            existing.last_used_at = now
            existing.wallet_type = wallet_type
            if label:
                existing.label = label
            session.commit()
            
            return WalletConnection(
                id=existing.id,
                tenant_id=existing.tenant_id,
                user_id=existing.user_id,
                wallet_address=existing.wallet_address,
                chain_id=existing.chain_id,
                wallet_type=existing.wallet_type,
                label=existing.label,
                is_primary=existing.is_primary,
                verified_at=existing.verified_at,
                last_used_at=existing.last_used_at,
                created_at=existing.created_at,
                metadata=existing.wallet_metadata or {}
            )
        
        # Create new wallet connection
        # Check if this should be the primary wallet (first wallet for user)
        user_wallets = session.query(WalletConnectionDB).filter_by(
            tenant_id=tenant_id,
            user_id=user_id
        ).count()
        
        is_primary = user_wallets == 0
        
        wallet_id = f"wallet_{int(datetime.now().timestamp() * 1000)}"
        
        new_wallet = WalletConnectionDB(
            id=wallet_id,
            tenant_id=tenant_id,
            user_id=user_id,
            wallet_address=checksummed,
            chain_id=chain_id,
            wallet_type=wallet_type,
            label=label or f"{wallet_type.title()} Wallet",
            is_primary=is_primary,
            verified_at=now,
            last_used_at=now,
            wallet_metadata={}
        )
        
        session.add(new_wallet)
        session.commit()
        
        return WalletConnection(
            id=new_wallet.id,
            tenant_id=new_wallet.tenant_id,
            user_id=new_wallet.user_id,
            wallet_address=new_wallet.wallet_address,
            chain_id=new_wallet.chain_id,
            wallet_type=new_wallet.wallet_type,
            label=new_wallet.label,
            is_primary=new_wallet.is_primary,
            verified_at=new_wallet.verified_at,
            last_used_at=new_wallet.last_used_at,
            created_at=new_wallet.created_at,
            metadata=new_wallet.wallet_metadata or {}
        )
    
    @staticmethod
    def get_user_wallets(
        session: Session,
        tenant_id: str,
        user_id: str
    ) -> List[WalletConnection]:
        """
        Get all wallet connections for a user.
        
        Args:
            session: Database session
            tenant_id: Tenant identifier
            user_id: User identifier
            
        Returns:
            List of WalletConnection objects
        """
        wallets = session.query(WalletConnectionDB).filter_by(
            tenant_id=tenant_id,
            user_id=user_id
        ).order_by(WalletConnectionDB.is_primary.desc(), WalletConnectionDB.created_at).all()
        
        return [
            WalletConnection(
                id=w.id,
                tenant_id=w.tenant_id,
                user_id=w.user_id,
                wallet_address=w.wallet_address,
                chain_id=w.chain_id,
                wallet_type=w.wallet_type,
                label=w.label,
                is_primary=w.is_primary,
                verified_at=w.verified_at,
                last_used_at=w.last_used_at,
                created_at=w.created_at,
                metadata=w.wallet_metadata or {}
            )
            for w in wallets
        ]
    
    @staticmethod
    def set_primary_wallet(
        session: Session,
        tenant_id: str,
        user_id: str,
        wallet_id: str
    ) -> bool:
        """
        Set a wallet as the primary wallet for a user.
        
        Args:
            session: Database session
            tenant_id: Tenant identifier
            user_id: User identifier
            wallet_id: Wallet connection ID
            
        Returns:
            True if successful
        """
        # Unset current primary
        session.query(WalletConnectionDB).filter_by(
            tenant_id=tenant_id,
            user_id=user_id
        ).update({"is_primary": False})
        
        # Set new primary
        wallet = session.query(WalletConnectionDB).filter_by(
            id=wallet_id,
            tenant_id=tenant_id,
            user_id=user_id
        ).first()
        
        if not wallet:
            return False
        
        wallet.is_primary = True
        session.commit()
        return True
    
    @staticmethod
    def disconnect_wallet(
        session: Session,
        tenant_id: str,
        user_id: str,
        wallet_id: str
    ) -> bool:
        """
        Disconnect (delete) a wallet connection.
        
        Args:
            session: Database session
            tenant_id: Tenant identifier
            user_id: User identifier
            wallet_id: Wallet connection ID
            
        Returns:
            True if deleted
        """
        wallet = session.query(WalletConnectionDB).filter_by(
            id=wallet_id,
            tenant_id=tenant_id,
            user_id=user_id
        ).first()
        
        if not wallet:
            return False
        
        session.delete(wallet)
        session.commit()
        return True
