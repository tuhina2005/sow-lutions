import { createClient } from '@supabase/supabase-js';

// Debug version of Supabase client with better error handling
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

// Create client with debug options
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'  // This is correct - Supabase uses 'public' schema by default
  },
  global: {
    headers: {
      'X-Client-Info': 'agritech-chatbot'
    }
  }
});

// Test connection on import
export const testConnection = async () => {
  try {
    console.log('🔍 Testing Supabase connection...');
    const { data, error } = await supabase
      .from('Users')
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

// Enhanced insert function with better error handling
export const safeInsert = async (table: string, data: any) => {
  try {
    console.log(`🔍 Inserting into ${table}:`, data);
    
    const { data: result, error } = await supabase
      .from(table)
      .insert(data)
      .select()
      .single();
    
    if (error) {
      console.error(`❌ Insert failed for ${table}:`, error);
      return { success: false, error, data: null };
    }
    
    console.log(`✅ Insert successful for ${table}:`, result);
    return { success: true, error: null, data: result };
  } catch (error) {
    console.error(`❌ Insert error for ${table}:`, error);
    return { success: false, error, data: null };
  }
};

// Enhanced select function with better error handling
export const safeSelect = async (table: string, columns: string = '*', filters?: any) => {
  try {
    console.log(`🔍 Selecting from ${table}:`, { columns, filters });
    
    let query = supabase.from(table).select(columns);
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error(`❌ Select failed for ${table}:`, error);
      return { success: false, error, data: null };
    }
    
    console.log(`✅ Select successful for ${table}:`, data);
    return { success: true, error: null, data };
  } catch (error) {
    console.error(`❌ Select error for ${table}:`, error);
    return { success: false, error, data: null };
  }
};
