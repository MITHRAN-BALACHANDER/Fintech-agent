"""
Wallet Integration Quick Start Example
Demonstrates the complete wallet connection flow
"""
import asyncio
import sys
import os

# Fix encoding for Windows
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

from core.database import init_database, get_session, UserDB
from core.wallet_service import WalletService
from core.wallet_auth import WalletAuthService
from eth_account import Account


async def main():
    print("=" * 60)
    print("Wallet Integration Quick Start")
    print("=" * 60)
    
    # Initialize database
    print("\n1. Initializing database...")
    engine = init_database("sqlite:///test_wallet_integration.db")
    session = get_session(engine)
    
    # Create test user and tenant
    print("2. Creating test user...")
    
    # Clean up existing test user
    existing = session.query(UserDB).filter_by(email="wallet_demo@example.com").first()
    if existing:
        session.delete(existing)
        session.commit()
    
    test_user = UserDB(
        id="demo_user_1",
        tenant_id="demo_tenant",
        email="wallet_demo@example.com",
        name="Demo User",
        password_hash="demo_hash"
    )
    session.add(test_user)
    session.commit()
    
    print(f"   ✓ Created user: {test_user.email}")
    print(f"   ✓ Tenant ID: {test_user.tenant_id}")
    print(f"   ✓ User ID: {test_user.id}")
    
    # Simulate wallet connection flow
    print("\n3. Simulating wallet connection flow...")
    
    # Create a test Ethereum account (in real use, this is user's MetaMask)
    test_account = Account.create()
    wallet_address = test_account.address
    print(f"   ✓ Test wallet address: {wallet_address}")
    
    # Step 1: Request nonce
    print("\n4. Step 1: Requesting authentication nonce...")
    nonce_data = WalletService.create_or_get_nonce(session, wallet_address)
    print(f"   ✓ Nonce: {nonce_data.nonce[:20]}...")
    print(f"   ✓ Expires at: {nonce_data.expires_at}")
    print(f"\n   Message to sign:\n   {'-' * 50}")
    print(f"   {nonce_data.message}")
    print(f"   {'-' * 50}")
    
    # Step 2: Sign message with wallet
    print("\n5. Step 2: Signing message with wallet...")
    from eth_account.messages import encode_defunct
    encoded_message = encode_defunct(text=nonce_data.message)
    signed_message = test_account.sign_message(encoded_message)
    signature = signed_message.signature.hex()
    print(f"   ✓ Signature: {signature[:20]}...{signature[-20:]}")
    
    # Step 3: Verify signature and connect wallet
    print("\n6. Step 3: Verifying signature and connecting wallet...")
    wallet_connection = WalletService.verify_and_connect_wallet(
        session=session,
        tenant_id=test_user.tenant_id,
        user_id=test_user.id,
        wallet_address=wallet_address,
        signature=signature,
        nonce=nonce_data.nonce,
        chain_id=1,  # Ethereum mainnet
        wallet_type="metamask",
        label="Demo MetaMask Wallet"
    )
    
    print(f"   ✓ Wallet connected!")
    print(f"   ✓ Wallet ID: {wallet_connection.id}")
    print(f"   ✓ Address: {wallet_connection.wallet_address}")
    print(f"   ✓ Chain: Ethereum (ID: {wallet_connection.chain_id})")
    print(f"   ✓ Primary: {wallet_connection.is_primary}")
    print(f"   ✓ Verified at: {wallet_connection.verified_at}")
    
    # Step 4: Generate wallet JWT token
    print("\n7. Step 4: Generating wallet-scoped JWT token...")
    jwt_token = WalletAuthService.generate_wallet_jwt(
        tenant_id=wallet_connection.tenant_id,
        user_id=wallet_connection.user_id,
        wallet_id=wallet_connection.id,
        wallet_address=wallet_connection.wallet_address,
        chain_id=wallet_connection.chain_id
    )
    
    print(f"   ✓ Token generated!")
    print(f"   ✓ Token type: {jwt_token.token_type}")
    print(f"   ✓ Expires in: {jwt_token.expires_in} seconds")
    print(f"   ✓ Access token: {jwt_token.access_token[:30]}...")
    
    # Verify JWT token
    print("\n8. Verifying JWT token...")
    payload = WalletAuthService.verify_wallet_jwt(jwt_token.access_token)
    print(f"   ✓ Token is valid!")
    print(f"   ✓ Tenant ID: {payload['tenant_id']}")
    print(f"   ✓ User ID: {payload['user_id']}")
    print(f"   ✓ Wallet ID: {payload['wallet_id']}")
    print(f"   ✓ Wallet Address: {payload['wallet_address']}")
    
    # Connect a second wallet
    print("\n9. Connecting a second wallet...")
    second_account = Account.create()
    second_nonce = WalletService.create_or_get_nonce(session, second_account.address)
    second_encoded = encode_defunct(text=second_nonce.message)
    second_signature = second_account.sign_message(second_encoded)
    
    second_wallet = WalletService.verify_and_connect_wallet(
        session=session,
        tenant_id=test_user.tenant_id,
        user_id=test_user.id,
        wallet_address=second_account.address,
        signature=second_signature.signature.hex(),
        nonce=second_nonce.nonce,
        chain_id=137,  # Polygon
        wallet_type="coinbase",
        label="Coinbase Wallet"
    )
    
    print(f"   ✓ Second wallet connected!")
    print(f"   ✓ Address: {second_wallet.wallet_address}")
    print(f"   ✓ Chain: Polygon (ID: {second_wallet.chain_id})")
    print(f"   ✓ Primary: {second_wallet.is_primary}")
    
    # List all wallets
    print("\n10. Listing all connected wallets...")
    all_wallets = WalletService.get_user_wallets(
        session=session,
        tenant_id=test_user.tenant_id,
        user_id=test_user.id
    )
    
    print(f"   ✓ Found {len(all_wallets)} wallets:")
    for i, wallet in enumerate(all_wallets, 1):
        primary_badge = "⭐ PRIMARY" if wallet.is_primary else ""
        print(f"   {i}. {wallet.label} - {wallet.wallet_address[:10]}... {primary_badge}")
        print(f"      Type: {wallet.wallet_type} | Chain ID: {wallet.chain_id}")
    
    # Set second wallet as primary
    print("\n11. Setting second wallet as primary...")
    WalletService.set_primary_wallet(
        session=session,
        tenant_id=test_user.tenant_id,
        user_id=test_user.id,
        wallet_id=second_wallet.id
    )
    print(f"   ✓ Primary wallet updated!")
    
    # Verify primary changed
    updated_wallets = WalletService.get_user_wallets(
        session=session,
        tenant_id=test_user.tenant_id,
        user_id=test_user.id
    )
    primary_wallet = next(w for w in updated_wallets if w.is_primary)
    print(f"   ✓ New primary: {primary_wallet.label}")
    
    # Disconnect first wallet
    print("\n12. Disconnecting first wallet...")
    WalletService.disconnect_wallet(
        session=session,
        tenant_id=test_user.tenant_id,
        user_id=test_user.id,
        wallet_id=wallet_connection.id
    )
    print(f"   ✓ Wallet disconnected!")
    
    # Final wallet count
    final_wallets = WalletService.get_user_wallets(
        session=session,
        tenant_id=test_user.tenant_id,
        user_id=test_user.id
    )
    print(f"   ✓ Remaining wallets: {len(final_wallets)}")
    
    print("\n" + "=" * 60)
    print("✅ Wallet Integration Demo Complete!")
    print("=" * 60)
    
    print("\n📝 Summary:")
    print("   • Created user and tenant")
    print("   • Connected 2 wallets using SIWE authentication")
    print("   • Generated wallet-scoped JWT tokens")
    print("   • Listed and managed wallet connections")
    print("   • Changed primary wallet")
    print("   • Disconnected a wallet")
    
    print("\n🔐 Security Notes:")
    print("   • Private keys NEVER stored on server")
    print("   • Only public addresses stored")
    print("   • Cryptographic signature verification")
    print("   • Multi-tenant isolation enforced")
    
    print("\n🚀 Next Steps:")
    print("   1. Start backend: uvicorn fintech_platform.fintech_os:app --reload")
    print("   2. Start frontend: cd frontend && npm run dev")
    print("   3. Visit http://localhost:3000 and connect your wallet!")
    
    session.close()


if __name__ == "__main__":
    asyncio.run(main())
