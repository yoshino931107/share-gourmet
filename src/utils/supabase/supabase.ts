import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "./database.types";

export const supabase = createBrowserSupabaseClient<Database>();
