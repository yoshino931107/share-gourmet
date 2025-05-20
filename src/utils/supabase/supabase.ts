import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "../supabase";

export const supabase = createBrowserSupabaseClient<Database>();
