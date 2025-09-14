import { createClient } from '@supabase/supabase-js'

// 🔹 Pegue a URL e a ANON KEY no painel do Supabase (Settings → API)
const supabaseUrl = 'https://cqaichotqqatfkqtcwrv.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxYWljaG90cXFhdGZrcXRjd3J2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyNjgwNDUsImV4cCI6MjA3MDg0NDA0NX0.2p44JxmRwigS3XznhrEEgc7Ts7g3Upz60FzW5eKgVww'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

