C:\Users\user_hebat\Downloads\Anthropic Serif-fontiko\Anthropic Serif-fontiko>dir
 Volume in drive C has no label.
 Volume Serial Number is CCAF-9878

 Directory of C:\Users\user_hebat\Downloads\Anthropic Serif-fontiko\Anthropic Serif-fontiko

06/09/2026  23:46    <DIR>          .
06/09/2026  23:46    <DIR>          ..
06/09/2026  23:46            67.588 AnthropicSerif-Display-Bold-Static.otf
06/09/2026  23:46            62.020 AnthropicSerif-Display-BoldItalic-Static.otf
06/09/2026  23:46            65.692 AnthropicSerif-Display-Extrabold-Static.otf
06/09/2026  23:46            58.952 AnthropicSerif-Display-ExtraboldItalic-Static.otf
06/09/2026  23:46            67.396 AnthropicSerif-Display-Light-Static.otf
06/09/2026  23:46            60.876 AnthropicSerif-Display-LightItalic-Static.otf
06/09/2026  23:46            66.812 AnthropicSerif-Display-Medium-Static.otf
06/09/2026  23:46            61.276 AnthropicSerif-Display-MediumItalic-Static.otf
06/09/2026  23:46            68.796 AnthropicSerif-Display-Regular-Static.otf
06/09/2026  23:46            62.760 AnthropicSerif-Display-RegularItalic-Static.otf
06/09/2026  23:46            66.856 AnthropicSerif-Display-Semibold-Static.otf
06/09/2026  23:46            61.888 AnthropicSerif-Display-SemiboldItalic-Static.otf
06/09/2026  23:46            68.096 AnthropicSerif-Text-Bold-Static.otf
06/09/2026  23:46            60.940 AnthropicSerif-Text-BoldItalic-Static.otf
06/09/2026  23:46            66.432 AnthropicSerif-Text-Extrabold-Static.otf
06/09/2026  23:46            58.020 AnthropicSerif-Text-ExtraboldItalic-Static.otf
06/09/2026  23:46            68.564 AnthropicSerif-Text-Light-Static.otf
06/09/2026  23:46            61.644 AnthropicSerif-Text-LightItalic-Static.otf
06/09/2026  23:46            67.528 AnthropicSerif-Text-Medium-Static.otf
06/09/2026  23:46            61.660 AnthropicSerif-Text-MediumItalic-Static.otf
06/09/2026  23:46            69.112 AnthropicSerif-Text-Regular-Static.otf
06/09/2026  23:46            61.492 AnthropicSerif-Text-RegularItalic-Static.otf
06/09/2026  23:46            67.496 AnthropicSerif-Text-Semibold-Static.otf
06/09/2026  23:46            61.912 AnthropicSerif-Text-SemiboldItalic-Static.otf
              24 File(s)      1.543.808 bytes
               2 Dir(s)  136.985.509.888 bytes free

C:\Users\user_hebat\Downloads\Anthropic Serif-fontiko\Anthropic Serif-fontiko>

Sip, sekarang kita bangun `hooks.server.ts`.

## `src/hooks.server.ts`

```ts
import { createServerClient } from '@supabase/ssr';
import { type Handle, redirect } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY } from '$env/static/public';

const supabase: Handle = async ({ event, resolve }) => {
	event.locals.supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
		cookies: {
			getAll: () => event.cookies.getAll(),
			setAll: (cookiesToSet) => {
				cookiesToSet.forEach(({ name, value, options }) => {
					event.cookies.set(name, value, { ...options, path: '/' });
				});
			}
		}
	});

	// getClaims() memvalidasi JWT secara kriptografis, aman dipakai buat cek identitas.
	// Ini pengganti getSession() yang TIDAK tervalidasi ulang ke Auth server.
	event.locals.safeGetClaims = async () => {
		const {
			data: { claims },
			error
		} = await event.locals.supabase.auth.getClaims();
		if (error) {
			return { claims: null, user: null };
		}
		return { claims, user: claims ? { id: claims.sub, email: claims.email } : null };
	};

	return resolve(event, {
		filterSerializedResponseHeaders(name) {
			return name === 'content-range' || name === 'x-supabase-api-version';
		}
	});
};

const authGuard: Handle = async ({ event, resolve }) => {
	const { user } = await event.locals.safeGetClaims();
	event.locals.user = user;

	// Proteksi semua route di bawah /dashboard
	if (event.url.pathname.startsWith('/dashboard') && !user) {
		redirect(303, '/login');
	}

	// Kalau udah login, jangan biarkan balik ke /login
	if (event.url.pathname === '/login' && user) {
		redirect(303, '/dashboard');
	}

	return resolve(event);
};

export const handle: Handle = sequence(supabase, authGuard);
```

## Update `src/app.d.ts`

TypeScript perlu tahu bentuk `event.locals` yang baru kita buat:

```ts
import type { SupabaseClient } from '@supabase/supabase-js';

declare global {
	namespace App {
		interface Locals {
			supabase: SupabaseClient;
			safeGetClaims: () => Promise<{
				claims: { sub: string; email?: string; [key: string]: unknown } | null;
				user: { id: string; email?: string } | null;
			}>;
			user: { id: string; email?: string } | null;
		}
	}
}

export {};
```

## Catatan penting

**1. Kenapa `getClaims()`, bukan `getSession()`?**
Karena session di cookie itu asalnya dari client, secara teori bisa dipalsukan oleh pihak yang tahu cara manipulasi cookie. `getClaims()` memverifikasi signature JWT secara kriptografis (pakai WebCrypto), jadi lebih bisa dipercaya buat keputusan otorisasi di server.

**2. Auth guard sekaligus proteksi seluruh `/dashboard`**
Dengan pola ini, kamu **gak perlu lagi** bikin manual check di tiap `dashboard/+layout.server.ts` — cukup sekali di `hooks.server.ts`, otomatis semua route di bawah `/dashboard` (`listings`, `orders`, `settings`, dll) ke-cover.

**3. `event.locals.user` bisa diakses di semua `+page.server.ts` dan remote functions**
Nanti kita pakai ini buat filter data (misal `getListingsByArtist` otomatis tau siapa yang login).

---

Setelah kamu paste dua file ini, jalankan `npm run dev` dan pastikan gak ada error TypeScript dulu (belum ada fitur login jalan, cuma mastiin gak ada type error). Kabari hasilnya, habis itu kita lanjut bikin halaman `/login`.

Oke, masuk akal — barebone dulu sekarang, polish detail nanti di Fase 6. Dan untuk icon + animasi, aku kasih rekomendasi library yang ringan dan cocok buat Svelte 5.

## Rekomendasi package tambahan

**Icon:** `@lucide/svelte` — icon set yang konsisten, ringan (tree-shakeable, jadi cuma icon yang dipake yang ke-bundle), dan udah official support Svelte 5.

**Animasi:** Svelte udah punya **built-in transition/animation** (`svelte/transition`, `svelte/animate`) yang cukup buat kebutuhan kita (fade, fly, slide, scale) — **gak perlu library eksternal** buat animasi dasar. Ini pilihan tepat karena zero-dependency dan udah teroptimasi native sama compiler Svelte. Kita pakai ini dulu; kalau nanti butuh animasi kompleks (spring physics, gesture-based), baru pertimbangkan `svelte-motion` atau semacamnya di fase polish.

Install icon package:
```bash
npm install @lucide/svelte
```

## Keputusan error page: 1 file generik (ikut saranku)

Alasannya: SvelteKit's `+error.svelte` otomatis nerima `page.status` dan `page.error.message` dari context — jadi 1 file bisa adaptif tanpa duplikasi. Split per-kode cuma worth dilakukan kalau nanti kontennya beda jauh (misal 404 butuh ilustrasi custom yang beda dari 500) — itu bisa kita upgrade nanti di Fase 6 tanpa restrukturisasi besar.

---

Sekarang aku susun ketiga bagian ini.

## 1. Splash Screen (barebone)

### `src/app.html` — splash sebelum JS load

```html
<!doctype html>
<html lang="id">
	<head>
		<meta charset="utf-8" />
		<link rel="icon" href="%sveltekit.assets%/favicon.svg" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		%sveltekit.head%
		<style>
			#initial-splash {
				position: fixed;
				inset: 0;
				display: flex;
				align-items: center;
				justify-content: center;
				background: #0a0a0a;
				z-index: 9999;
			}
			#initial-splash svg {
				animation: spin 1s linear infinite;
			}
			@keyframes spin {
				to { transform: rotate(360deg); }
			}
		</style>
	</head>
	<body data-sveltekit-preload-data="hover">
		<div id="initial-splash">
			<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
				<path d="M21 12a9 9 0 1 1-6.219-8.56" />
			</svg>
		</div>
		<div style="display: contents">%sveltekit.body%</div>
		<script>
			// Hilangkan splash begitu SvelteKit app mount
			window.addEventListener('DOMContentLoaded', () => {
				requestAnimationFrame(() => {
					const splash = document.getElementById('initial-splash');
					if (splash) splash.remove();
				});
			});
		</script>
	</body>
</html>
```

### `src/lib/components/shared/LoadingSpinner.svelte` — dipakai di dalam app (misal auth callback)

```svelte
<script lang="ts">
	import { LoaderCircle } from '@lucide/svelte';

	let { message = 'Memuat...' }: { message?: string } = $props();
</script>

<div class="flex min-h-[50vh] flex-col items-center justify-center gap-3">
	<LoaderCircle class="h-8 w-8 animate-spin text-neutral-500" />
	<p class="text-sm text-neutral-500">{message}</p>
</div>
```

## 2. Skeleton Loader

### `src/lib/components/shared/Skeleton.svelte` — primitive dasar, reusable

```svelte
<script lang="ts">
	let { class: className = '' }: { class?: string } = $props();
</script>

<div class="animate-pulse rounded-md bg-neutral-200 dark:bg-neutral-800 {className}"></div>
```

### `src/lib/components/shared/CardSkeleton.svelte` — contoh pemakaian untuk Gallery/Shop Grid

```svelte
<script lang="ts">
	import Skeleton from './Skeleton.svelte';
</script>

<div class="space-y-2">
	<Skeleton class="aspect-square w-full" />
	<Skeleton class="h-4 w-3/4" />
	<Skeleton class="h-3 w-1/2" />
</div>
```

**Cara pakai nanti** (contoh konsep, bukan final):
```svelte
{#if loading}
	{#each Array(6) as _}
		<CardSkeleton />
	{/each}
{:else}
	{#each listings as listing}
		<ProductCard {listing} />
	{/each}
{/if}
```

## 3. Error Page

### `src/routes/+error.svelte` — generik, adaptif sesuai status

```svelte
<script lang="ts">
	import { page } from '$app/state';
	import { TriangleAlert, FileQuestion, Lock, ServerCrash } from '@lucide/svelte';

	const status = $derived(page.status);

	const content = $derived.by(() => {
		switch (status) {
			case 404:
				return {
					icon: FileQuestion,
					title: 'Halaman Tidak Ditemukan',
					desc: 'Halaman yang kamu cari mungkin sudah dipindah atau tidak pernah ada.'
				};
			case 401:
				return {
					icon: Lock,
					title: 'Belum Login',
					desc: 'Kamu perlu login dulu untuk mengakses halaman ini.'
				};
			case 403:
				return {
					icon: Lock,
					title: 'Akses Ditolak',
					desc: 'Kamu tidak punya izin untuk mengakses halaman ini.'
				};
			case 500:
				return {
					icon: ServerCrash,
					title: 'Terjadi Kesalahan Server',
					desc: 'Ada masalah di sisi kami. Coba lagi beberapa saat lagi.'
				};
			default:
				return {
					icon: TriangleAlert,
					title: 'Terjadi Kesalahan',
					desc: page.error?.message ?? 'Sesuatu tidak berjalan sesuai rencana.'
				};
		}
	});
</script>

<div class="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
	<content.icon class="h-12 w-12 text-neutral-400" />
	<h1 class="text-2xl font-semibold">{content.title}</h1>
	<p class="max-w-md text-neutral-500">{content.desc}</p>
	<a href="/" class="mt-2 rounded-md bg-neutral-900 px-4 py-2 text-sm text-white hover:bg-neutral-700">
		Kembali ke Beranda
	</a>
</div>
```

**Catatan soal `page.status`:** ini otomatis terisi oleh SvelteKit setiap kali ada `throw error(statusCode, message)` dari `load` function atau `+page.server.ts` manapun — kita gak perlu setup manual di tiap route, cukup 1 file ini di root `src/routes/+error.svelte` sudah nge-cover **semua** route (termasuk yang di dalam route groups).

---

Install dulu `@lucide/svelte`, taruh ketiga file di atas, terus jalankan `npm run dev` buat cek gak ada error. Kalau mau nge-test error page-nya, sementara bisa akses URL random yang gak ada (misal `/asdasd`) buat lihat 404 page-nya muncul.

Setelah ini beres, kita balik lanjut ke **Fase 1: bikin halaman `/login`**.

Betul, gak masalah — tapi ada nuansa penting yang perlu kamu paham soal *kenapa* splash ini beda dari komponen Svelte biasa.

## Kenapa harus di `app.html`, bukan komponen `.svelte`?

Karena tujuannya adalah nutup **jeda antara HTML pertama kali muncul di browser** dan **JS/CSS SvelteKit selesai di-load & di-mount**. Di jeda itu, gak ada satupun komponen Svelte yang "hidup" — makanya splash ini harus berupa HTML+CSS polos yang browser bisa render duluan sebelum JS jalan sama sekali.

Kalau kamu bikin splash sebagai komponen Svelte biasa (misal `SplashScreen.svelte` yang dipasang di root `+layout.svelte`), itu **gak akan nutup jeda awal** itu — karena komponen Svelte baru bisa render *setelah* JS ke-load, which artinya splash-nya baru muncul pas app-nya udah siap (percuma, momennya udah lewat).

## Implikasi buat kamu

**Ya, tweak desain splash ini emang di `app.html`** — tapi cakupannya sengaja dibatasi cuma:
- Logo/spinner sederhana
- CSS inline (gak bisa import Tailwind classes di sini karena Tailwind belum ke-compile/load di titik ini — makanya aku pakai `<style>` native tadi)
- Gak ada reactivity/state Svelte

Kalau nanti di Fase 6 kamu mau splash yang lebih "niat" (animasi logo custom, transisi smooth, dll), itu masih tetap **di `app.html`**, cuma CSS animation-nya dibikin lebih detail — bukan pindah ke komponen Svelte.

## Yang **beda** — loading state *di dalam* app (setelah splash awal hilang)

Ini yang tadi aku bikinkan `LoadingSpinner.svelte` — ini **komponen Svelte biasa**, dipakai buat loading state di tengah pemakaian app (misal nunggu OAuth callback selesai, atau nunggu fetch data showcase). Bedanya:

| | Initial Splash (`app.html`) | Loading State (`.svelte`) |
|---|---|---|
| Kapan muncul | Sebelum JS/CSS ke-load sama sekali | Setelah app jalan, pas nunggu suatu proses/data |
| Bisa reactive? | Tidak | Ya, penuh reactivity Svelte |
| Styling | CSS inline murni | Tailwind classes, bisa pakai komponen lain |
| Contoh pemakaian | Loading pertama kali buka web | Nunggu OAuth redirect, nunggu fetch listing |

Jadi kesimpulannya: **splash awal** = tweak di `app.html`. **Loading di titik-titik lain** (auth callback, fetch data) = pakai komponen `LoadingSpinner.svelte` yang udah aku buatkan, dipasang di halaman/route yang relevan.
