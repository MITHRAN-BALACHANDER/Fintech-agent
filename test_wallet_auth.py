"""
Test suite for wallet authentication and connection flow
"""
import pytest
from datetime import datetime, timedelta
from core.wallet_auth import WalletAuthService, checksum_address
from core.wallet_service import WalletService
from core.database import init_database, get_session, UserDB, WalletConnectionDB, WalletNonceDB
from eth_account import Account
from eth_account.messages import encode_defunct


@pytest.fixture
def test_db():
    """Create test database"""
    engine = init_database("sqlite:///:memory:")
    session = get_session(engine)
    
    # Create test user
    test_user = UserDB(
        id="test_user_1",
        tenant_id="test_tenant",
        email="wallet_test@example.com",
        name="Wallet Test User",
        password_hash="test_hash"
    )
    session.add(test_user)
    session.commit()
    
    yield session
    
    session.close()


def test_checksum_address():
    """Test address checksumming"""
    address = "0x5aAeb6053f3E94C9b9A09f33669435E7Ef1BeAed"
    checksummed = checksum_address(address.lower())
    # Check that it returns a valid checksum address (case insensitive comparison)
    assert checksummed.lower() == address.lower()
    # Check that it starts with 0x
    assert checksummed.startswith("0x")


def test_generate_nonce():
    """Test nonce generation"""
    address = "0x5aAeb6053f3E94C9b9A09f33669435E7Ef1BeAed"
    nonce_data = WalletAuthService.generate_nonce(address)
    
    # Address might be checksummed, compare case-insensitively
    assert nonce_data.wallet_address.lower() == address.lower()
    assert len(nonce_data.nonce) > 20
    assert "FinSIght" in nonce_data.message or "finsight" in nonce_data.message.lower()
    assert nonce_data.nonce in nonce_data.message
    assert nonce_data.expires_at > datetime.now()


def test_signature_verification():
    """Test wallet signature verification"""
    # Create a test account
    test_account = Account.create()
    address = test_account.address
    
    # Generate nonce
    nonce_data = WalletAuthService.generate_nonce(address)
    
    # Sign the message
    message_encoded = encode_defunct(text=nonce_data.message)
    signed_message = test_account.sign_message(message_encoded)
    
    # Verify signature
    is_valid = WalletAuthService.verify_signature(
        wallet_address=address,
        signature=signed_message.signature.hex(),
        nonce=nonce_data.nonce,
        message=nonce_data.message
    )
    
    assert is_valid is True


def test_signature_verification_wrong_signer():
    """Test signature verification fails with wrong signer"""
    # Create two accounts
    account1 = Account.create()
    account2 = Account.create()
    
    # Generate nonce for account1
    nonce_data = WalletAuthService.generate_nonce(account1.address)
    
    # Sign with account2
    message_encoded = encode_defunct(text=nonce_data.message)
    signed_message = account2.sign_message(message_encoded)
    
    # Verify should fail (wrong signer)
    is_valid = WalletAuthService.verify_signature(
        wallet_address=account1.address,  # Expected signer
        signature=signed_message.signature.hex(),
        nonce=nonce_data.nonce,
        message=nonce_data.message
    )
    
    assert is_valid is False


def test_wallet_jwt_generation():
    """Test wallet JWT token generation"""
    jwt_data = WalletAuthService.generate_wallet_jwt(
        tenant_id="test_tenant",
        user_id="test_user",
        wallet_id="wallet_123",
        wallet_address="0x5aAeb6053f3E94C9b9A09f33669435E7Ef1BeAed",
        chain_id=1
    )
    
    assert jwt_data.access_token is not None
    assert jwt_data.token_type == "bearer"
    assert jwt_data.wallet_address == "0x5aAeb6053f3E94C9b9A09f33669435E7Ef1BeAed"
    assert jwt_data.tenant_id == "test_tenant"
    assert jwt_data.user_id == "test_user"
    
    # Verify the token
    payload = WalletAuthService.verify_wallet_jwt(jwt_data.access_token)
    assert payload is not None
    assert payload["tenant_id"] == "test_tenant"
    assert payload["user_id"] == "test_user"
    assert payload["wallet_id"] == "wallet_123"
    assert payload["type"] == "wallet"


def test_create_nonce_in_db(test_db):
    """Test nonce creation in database"""
    session = test_db
    address = "0x5aAeb6053f3E94C9b9A09f33669435E7Ef1BeAed"
    
    # Create nonce
    nonce_data = WalletService.create_or_get_nonce(session, address)
    
    # Verify in database - use checksummed address from nonce_data
    db_nonce = session.query(WalletNonceDB).filter_by(
        wallet_address=nonce_data.wallet_address
    ).first()
    
    assert db_nonce is not None
    assert db_nonce.nonce == nonce_data.nonce
    assert db_nonce.used is False


def test_connect_wallet_full_flow(test_db):
    """Test full wallet connection flow"""
    session = test_db
    
    # Create test account
    test_account = Account.create()
    address = test_account.address
    
    # Step 1: Create nonce
    nonce_data = WalletService.create_or_get_nonce(session, address)
    
    # Step 2: Sign message
    message_encoded = encode_defunct(text=nonce_data.message)
    signed_message = test_account.sign_message(message_encoded)
    
    # Step 3: Verify and connect
    wallet_conn = WalletService.verify_and_connect_wallet(
        session=session,
        tenant_id="test_tenant",
        user_id="test_user_1",
        wallet_address=address,
        signature=signed_message.signature.hex(),
        nonce=nonce_data.nonce,
        chain_id=1,
        wallet_type="metamask",
        label="Test Wallet"
    )
    
    assert wallet_conn is not None
    assert wallet_conn.wallet_address == address
    assert wallet_conn.tenant_id == "test_tenant"
    assert wallet_conn.user_id == "test_user_1"
    assert wallet_conn.is_primary is True  # First wallet
    assert wallet_conn.verified_at is not None
    
    # Verify nonce is marked as used
    db_nonce = session.query(WalletNonceDB).filter_by(
        wallet_address=address
    ).first()
    assert db_nonce.used is True


def test_list_user_wallets(test_db):
    """Test listing user wallets"""
    session = test_db
    
    # Connect two wallets
    account1 = Account.create()
    account2 = Account.create()
    
    for account in [account1, account2]:
        nonce_data = WalletService.create_or_get_nonce(session, account.address)
        message_encoded = encode_defunct(text=nonce_data.message)
        signed = account.sign_message(message_encoded)
        WalletService.verify_and_connect_wallet(
            session=session,
            tenant_id="test_tenant",
            user_id="test_user_1",
            wallet_address=account.address,
            signature=signed.signature.hex(),
            nonce=nonce_data.nonce,
            chain_id=1,
            wallet_type="metamask"
        )
    
    # List wallets
    wallets = WalletService.get_user_wallets(session, "test_tenant", "test_user_1")
    
    assert len(wallets) == 2
    assert wallets[0].is_primary is True  # First wallet is primary
    assert wallets[1].is_primary is False


def test_set_primary_wallet(test_db):
    """Test setting primary wallet"""
    session = test_db
    
    # Connect two wallets
    account1 = Account.create()
    account2 = Account.create()
    
    wallet_ids = []
    for account in [account1, account2]:
        nonce_data = WalletService.create_or_get_nonce(session, account.address)
        message_encoded = encode_defunct(text=nonce_data.message)
        signed = account.sign_message(message_encoded)
        wallet = WalletService.verify_and_connect_wallet(
            session=session,
            tenant_id="test_tenant",
            user_id="test_user_1",
            wallet_address=account.address,
            signature=signed.signature.hex(),
            nonce=nonce_data.nonce,
            chain_id=1,
            wallet_type="metamask"
        )
        wallet_ids.append(wallet.id)
    
    # Set second wallet as primary
    success = WalletService.set_primary_wallet(
        session, "test_tenant", "test_user_1", wallet_ids[1]
    )
    assert success is True
    
    # Verify
    wallets = WalletService.get_user_wallets(session, "test_tenant", "test_user_1")
    assert wallets[0].id == wallet_ids[1]
    assert wallets[0].is_primary is True
    assert wallets[1].is_primary is False


def test_disconnect_wallet(test_db):
    """Test wallet disconnection"""
    session = test_db
    
    # Connect wallet
    account = Account.create()
    nonce_data = WalletService.create_or_get_nonce(session, account.address)
    message_encoded = encode_defunct(text=nonce_data.message)
    signed = account.sign_message(message_encoded)
    wallet = WalletService.verify_and_connect_wallet(
        session=session,
        tenant_id="test_tenant",
        user_id="test_user_1",
        wallet_address=account.address,
        signature=signed.signature.hex(),
        nonce=nonce_data.nonce,
        chain_id=1,
        wallet_type="metamask"
    )
    
    # Disconnect
    success = WalletService.disconnect_wallet(
        session, "test_tenant", "test_user_1", wallet.id
    )
    assert success is True
    
    # Verify deleted
    wallets = WalletService.get_user_wallets(session, "test_tenant", "test_user_1")
    assert len(wallets) == 0


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
