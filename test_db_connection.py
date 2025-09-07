#!/usr/bin/env python3

import os
import sys
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables from .env file
load_dotenv()

def test_database_connection():
    """Test Supabase database connection"""
    
    # Get environment variables
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    
    print("🔍 Testing Supabase Database Connection...")
    print(f"URL: {supabase_url}")
    print(f"Key: {supabase_key[:20]}..." if supabase_key else "❌ No key found")
    
    if not supabase_url or not supabase_key:
        print("❌ Error: Missing environment variables")
        print("Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file")
        return False
    
    try:
        # Create Supabase client
        supabase: Client = create_client(supabase_url, supabase_key)
        print("✅ Supabase client created successfully")
        
        # Test connection by trying to read from soil_data table
        print("🔍 Testing table access...")
        result = supabase.table("soil_data").select("*").limit(1).execute()
        print(f"✅ Successfully connected to soil_data table")
        print(f"📊 Found {len(result.data)} records in table")
        
        return True
        
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        print("\n💡 Troubleshooting tips:")
        print("1. Check if your service role key is correct")
        print("2. Verify the table 'soil_data' exists")
        print("3. Check if Row Level Security (RLS) is enabled")
        print("4. Ensure your service role key has proper permissions")
        return False

if __name__ == "__main__":
    success = test_database_connection()
    sys.exit(0 if success else 1)
