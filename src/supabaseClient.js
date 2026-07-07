import { createClient } from '@supabase/supabase-js'
const supabaseUrl = 'https://xjcrdrkyydhthtulirlv.supabase.co'
const supabaseKey = 'sb_publishable_2RembVN5nG-ramKBsCg3fg_FPWhQsrd'
export const supabase = createClient(supabaseUrl, supabaseKey)

