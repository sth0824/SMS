import { createClient, SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** 환경변수가 채워져 있는지 여부. UI에서 설정 안내 배너를 띄울 때 사용. */
export const isSupabaseConfigured = Boolean(url && anonKey);

/**
 * 환경변수가 없으면 createClient가 throw 하므로, 미설정 시에는
 * 더미 URL로 클라이언트를 만들어 두고 isSupabaseConfigured 로 가드한다.
 */
export const supabase: SupabaseClient = createClient(
  url || "https://placeholder.supabase.co",
  anonKey || "placeholder-anon-key"
);
