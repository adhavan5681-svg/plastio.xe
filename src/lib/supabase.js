import { createClient } from '@supabase/supabase-js';

// Lazy initialization to avoid build-time errors when env vars are not available
let supabaseClient = null;

export const supabase = {
  getClient: () => {
    if (!supabaseClient) {
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase URL and Anon Key are required. Please set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.');
      }
      
      supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    }
    return supabaseClient;
  },
  
  // Proxy all methods to the actual client
  storage: {
    from: (bucket) => {
      const client = supabase.getClient();
      return client.storage.from(bucket);
    }
  },
  
  // Add other methods as needed
  auth: {
    getUser: async (token) => {
      const client = supabase.getClient();
      return client.auth.getUser(token);
    }
  }
};
