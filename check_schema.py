import sqlite3

conn = sqlite3.connect('fintech_agent.db')
cursor = conn.cursor()

# Get table schema
cursor.execute("PRAGMA table_info(users)")
cols = cursor.fetchall()

print("Users table columns:")
for col in cols:
    print(f"  {col[1]} ({col[2]})")

print(f"\nTotal columns: {len(cols)}")
print(f"Has tenant_id: {'tenant_id' in [c[1] for c in cols]}")

conn.close()
