import { createClient } from '@supabase/supabase-js';

// Fixed Supabase client with proper schema handling
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl) {
  console.error('❌ VITE_SUPABASE_URL is not defined in environment variables');
  throw new Error('VITE_SUPABASE_URL is required');
}

if (!supabaseAnonKey) {
  console.error('❌ VITE_SUPABASE_ANON_KEY is not defined in environment variables');
  throw new Error('VITE_SUPABASE_ANON_KEY is required');
}

console.log('✅ Supabase URL:', supabaseUrl);
console.log('✅ Supabase Key:', supabaseAnonKey ? 'Set' : 'Missing');

// Create client - Supabase automatically uses 'public' schema
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'X-Client-Info': 'agritech-chatbot'
    }
  }
});

// Test connection and table existence
export const testConnection = async () => {
  try {
    console.log('🔍 Testing Supabase connection...');
    
    // Test basic connection
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Supabase connection failed:', error);
      return { success: false, error };
    }
    
    console.log('✅ Supabase connection successful');
    return { success: true, data };
  } catch (error) {
    console.error('❌ Supabase connection error:', error);
    return { success: false, error };
  }
};

// Test if specific table exists
export const testTableExists = async (tableName: string) => {
  try {
    console.log(`🔍 Testing if table '${tableName}' exists...`);
    
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
    
    if (error) {
      console.error(`❌ Table '${tableName}' doesn't exist:`, error);
      return { success: false, error, exists: false };
    }
    
    console.log(`✅ Table '${tableName}' exists with ${data?.length || 0} records`);
    return { success: true, error: null, exists: true, data };
  } catch (error) {
    console.error(`❌ Error testing table '${tableName}':`, error);
    return { success: false, error, exists: false };
  }
};

// Safe insert with better error handling
export const safeInsert = async (table: string, data: any) => {
  try {
    console.log(`🔍 Inserting into '${table}':`, data);
    
    const { data: result, error } = await supabase
      .from(table)
      .insert(data)
      .select()
      .single();
    
    if (error) {
      console.error(`❌ Insert failed for '${table}':`, error);
      return { success: false, error, data: null };
    }
    
    console.log(`✅ Insert successful for '${table}':`, result);
    return { success: true, error: null, data: result };
  } catch (error) {
    console.error(`❌ Insert error for '${table}':`, error);
    return { success: false, error, data: null };
  }
};

// Safe select with better error handling
export const safeSelect = async (table: string, columns: string = '*', filters?: any) => {
  try {
    console.log(`🔍 Selecting from '${table}':`, { columns, filters });
    
    let query = supabase.from(table).select(columns);
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error(`❌ Select failed for '${table}':`, error);
      return { success: false, error, data: null };
    }
    
    console.log(`✅ Select successful for '${table}':`, data);
    return { success: true, error: null, data };
  } catch (error) {
    console.error(`❌ Select error for '${table}':`, error);
    return { success: false, error, data: null };
  }
};

// Test all required tables
export const testAllTables = async () => {
  const requiredTables = ['users', 'user_farms', 'crops', 'soil_properties', 'user_history'];
  const results = [];
  
  for (const table of requiredTables) {
    const result = await testTableExists(table);
    results.push({ table, ...result });
  }
  
  return results;
};
