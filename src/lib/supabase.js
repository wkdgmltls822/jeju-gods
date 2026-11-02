import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

// .env.local 이 비어 있으면 null — 호출하는 쪽에서 안내 메시지를 띄웁니다
export const supabase = url && key ? createClient(url, key) : null
