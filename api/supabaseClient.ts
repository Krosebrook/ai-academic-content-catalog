import { createClient } from '@supabase/supabase-js';

// Load Supabase credentials from environment variables.
// These must be set in your hosting environment.
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    const warningMessage = `Supabase environment variables (SUPABASE_URL, SUPABASE_ANON_KEY) are not set. The app will not connect to a backend.`;
    console.warn(warningMessage);
    // In a production environment, you might want to throw an error to prevent the app from running without a database connection.
    // throw new Error(warningMessage);
}

// Create the client. If the variables are missing, `createClient` will receive empty strings
// and will fail gracefully when a connection is attempted, logging errors to the console.
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');