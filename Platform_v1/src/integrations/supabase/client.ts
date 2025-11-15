import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ynzctnldksyflxujvfut.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InluemN0bmxka3N5Zmx4dWp2ZnV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5NzMxNDEsImV4cCI6MjA3ODU0OTE0MX0.kuTNB7kjcRS-VnmojCuenIgqXh9jeqb_VJ90wUp-PjU'

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Import the supabase client like this:
// For React:
// import { supabase } from "@/integrations/supabase/client";
// For React Native:
// import { supabase } from "@/src/integrations/supabase/client";
