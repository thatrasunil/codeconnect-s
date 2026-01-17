
import os
import sys
import django
from django.conf import settings

# Configure Django settings if not already configured (minimal setup for script)
# However, since we are inside the django project structure, we might want to just rely on env?
# Ideally, we just use the standalone modules we wrote.
# db.mongodb is standalone.
# core.utils.firebase_client is standalone-ish (depends on firebase_admin).
# BUT, we need to make sure python path includes current dir.
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from db.mongodb import mongodb
    from core.utils.firebase_client import get_firestore_client
except ImportError:
    # If running from root, try appending . to path
    sys.path.append(os.getcwd())
    from db.mongodb import mongodb
    from core.utils.firebase_client import get_firestore_client

def migrate_collection(db, collection_name):
    """Migrate a Firestore collection to MongoDB"""
    print(f"Migrating {collection_name}...")
    
    if not db:
        print("❌ Firestore client not available.")
        return

    if not mongodb or not mongodb.db:
        print("❌ MongoDB client not available.")
        return
    
    # Get all documents from Firestore
    docs = db.collection(collection_name).stream()
    
    documents = []
    count = 0
    for doc in docs:
        data = doc.to_dict()
        data['id'] = doc.id  # Preserve original Firestore ID
        documents.append(data)
        count += 1
    
    # Insert into MongoDB
    if documents:
        try:
             # Use the specific collection explicitly
             mongo_col = mongodb.db[collection_name]
             
             # Optional: Clear existing to avoid duplicates or use bulk write with upsert?
             # For simple migration, we might just insert. 
             # But if run multiple times, it will duplicate.
             # Let's use replace_one with upsert for idempotency based on 'id'
             
             from pymongo import UpdateOne
             operations = []
             for doc in documents:
                 operations.append(
                     UpdateOne({'id': doc['id']}, {'$set': doc}, upsert=True)
                 )
             
             if operations:
                 result = mongo_col.bulk_write(operations)
                 print(f"✅ Migrated {count} documents from {collection_name} (Matched: {result.matched_count}, Upserted: {result.upserted_count})")
        except Exception as e:
            print(f"❌ Error inserting into MongoDB {collection_name}: {e}")
    else:
        print(f"⚠️ No documents found in {collection_name}")

def main():
    print("🚀 Starting Migration: Firestore -> MongoDB")
    
    firestore_db = get_firestore_client()
    if not firestore_db:
        print("❌ Cannot connect to Firestore. Check your credentials.")
        return

    if not mongodb:
        print("❌ Cannot connect to MongoDB. Check your MONGODB_URI.")
        return

    # Migrate all collections
    collections = ['users', 'rooms', 'messages', 'problems', 'whiteboard']
    for col in collections:
        migrate_collection(firestore_db, col)

    print("✅ Migration complete!")

if __name__ == '__main__':
    main()
