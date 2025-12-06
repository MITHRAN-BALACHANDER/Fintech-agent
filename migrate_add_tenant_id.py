"""
Migration script to add tenant_id column to existing users table
"""
import sqlite3
import os

def migrate():
    db_path = "fintech_agent.db"
    
    if not os.path.exists(db_path):
        print(f"❌ Database {db_path} not found!")
        return
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Check if tenant_id column already exists
        cursor.execute("PRAGMA table_info(users)")
        columns = [col[1] for col in cursor.fetchall()]
        
        if 'tenant_id' in columns:
            print("✅ tenant_id column already exists!")
            return
        
        print("Adding tenant_id column to users table...")
        
        # Add tenant_id column with default value
        cursor.execute("""
            ALTER TABLE users 
            ADD COLUMN tenant_id VARCHAR NOT NULL DEFAULT 'default'
        """)
        
        # Create index on tenant_id
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS ix_users_tenant_id ON users(tenant_id)
        """)
        
        conn.commit()
        print("✅ Successfully added tenant_id column!")
        
        # Verify
        cursor.execute("PRAGMA table_info(users)")
        columns = cursor.fetchall()
        print(f"\n📋 Updated users table ({len(columns)} columns):")
        for col in columns:
            print(f"  - {col[1]} ({col[2]})")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    migrate()
