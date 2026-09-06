// See https://svelte.dev/docs/kit/types#app.d.ts

import type { SupabaseClient } from "@supabase/supabase-js";

// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      supabase: SupabaseClient;
      safeGetClaims: () => Promise<{
        claims: { sub: string; email?: string; [key: string]: unknown } | null;
        user: { id: string; email?: string } | null;
      }>;
      user: { id: string; email?: string } | null;
    }
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
}

export {};
