import { createServerClient } from "@supabase/ssr";
import { type Handle, redirect } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";
import {
  PUBLIC_SUPABASE_URL,
  PUBLIC_SUPABASE_PUBLISHABLE_KEY,
} from "$env/static/public";
import { logger } from "$lib/server/logger";

const supabase: Handle = async ({ event, resolve }) => {
  event.locals.supabase = createServerClient(
    PUBLIC_SUPABASE_URL,
    PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll: () => event.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            event.cookies.set(name, value, { ...options, path: "/" });
          });
        },
      },
    },
  );

  // getClaims() memvalidasi JWT secara kriptografis, aman dipakai buat cek identitas.
  // Ini pengganti getSession() yang TIDAK tervalidasi ulang ke Auth server.
  event.locals.safeGetClaims = async () => {
    const { data, error } = await event.locals.supabase.auth.getClaims();
    if (error || !data) {
      return { claims: null, user: null };
    }
    const { claims } = data;
    return {
      claims,
      user: { id: claims.sub, email: claims.email as string | undefined },
    };
  };

  return resolve(event, {
    filterSerializedResponseHeaders(name) {
      return name === "content-range" || name === "x-supabase-api-version";
    },
  });
};

const authGuard: Handle = async ({ event, resolve }) => {
  const { user } = await event.locals.safeGetClaims();
  event.locals.user = user;

  // Proteksi semua route di bawah /dashboard
  if (event.url.pathname.startsWith("/dashboard") && !user) {
    logger.warn("Unauthorized dashboard access attempt", {
      path: event.url.pathname,
    });
    redirect(303, "/login");
  }

  // Kalau udah login, jangan biarkan balik ke /login
  if (event.url.pathname === "/login" && user) {
    redirect(303, "/dashboard");
  }

  return resolve(event);
};

const requestLogger: Handle = async ({ event, resolve }) => {
  const start = Date.now();
  const response = await resolve(event);
  const duration = Date.now() - start;

  logger.info("Request handled", {
    method: event.request.method,
    path: event.url.pathname,
    status: response.status,
    durationMs: duration,
    userId: event.locals.user?.id ?? null,
  });

  return response;
};

export const handle: Handle = sequence(requestLogger, supabase, authGuard);
