# Craftique-ID — Development TODO

Roadmap disusun per-fase, urutan pengerjaan dari atas ke bawah.
Centang [x] kalau sudah selesai.

---

## Fase 0: Setup & Foundation

- [ ] Init project: `npx sv create craftique-id` (pilih SvelteKit + TypeScript)
- [ ] Setup Supabase project baru (dapatkan `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SERVICE_ROLE_KEY`)
- [ ] Install dependencies inti: `drizzle-orm`, `drizzle-kit`, `postgres`, `@supabase/supabase-js`, `@supabase/ssr`
- [ ] Install UI deps: `bits-ui`, `svelte-dnd-action`, `svelte-awesome-color-picker` (atau bikin sendiri pakai bits-ui)
- [ ] Setup `.env` + `.env.example`
- [ ] Setup `drizzle.config.ts` + koneksi ke Supabase Postgres
- [ ] Verifikasi versi SvelteKit support Remote Functions stabil (cek changelog)
- [ ] Setup struktur folder sesuai rancangan (`lib/server`, `lib/components`, dll)
- [ ] Deploy skeleton project ke Vercel, pastikan build sukses (sanity check awal)

## Fase 1: Auth

- [ ] Setup Supabase Auth: enable Google OAuth provider
- [ ] Setup `hooks.server.ts` — inject Supabase client + session ke tiap request
- [ ] Buat halaman `/login`
- [ ] Buat `/auth/callback` — handle OAuth redirect dari Supabase
- [ ] Buat guard di `dashboard/+layout.server.ts` — redirect ke `/login` kalau belum auth
- [ ] Buat tabel `users` (extend dari `auth.users`) + trigger auto-insert saat user baru sign up
- [ ] Test flow: login Google → redirect dashboard → logout

## Fase 2: Database Schema

- [ ] Tulis semua schema Drizzle: `users`, `artist_profiles`, `showcases`, `showcase_sections`, `listings`, `orders`, `payment_proofs`, `testimonials`
- [ ] Generate & jalankan migration pertama (`drizzle-kit generate` + `migrate`)
- [ ] Setup Row Level Security (RLS) policies di Supabase:
  - [ ] Artist cuma bisa edit data miliknya sendiri
  - [ ] Buyer cuma bisa lihat order miliknya sendiri
  - [ ] `payment_info` tidak publicly readable
- [ ] Seed data dummy buat testing (1-2 artist profile, beberapa listing)

## Fase 3: Showcase Builder (Level 2 — Section Based)

- [ ] Buat 3-4 template layout preset (struktur dasar, bukan isi konten)
- [ ] Buat 9 komponen showcase section (Hero, About, Gallery, Shop, Commission Rates, Testimonial, FAQ, Social Links, Contact WA)
- [ ] Buat remote functions: `getShowcaseBySlug`, `updateSectionOrder`, `toggleSectionVisibility`, `updateSectionConfig`
- [ ] Buat UI dashboard: `SectionList.svelte` dengan drag-reorder (svelte-dnd-action)
- [ ] Buat `SectionConfigPanel.svelte` — form config per-tipe section (dinamis sesuai `type`)
- [ ] Buat `ColorPicker.svelte` (bits-ui popover + preset palette + hex input)
- [ ] Buat halaman publik showcase `/artist/[slug]` — render sections sesuai `order_index` & `is_visible`
- [ ] Test: artist bisa reorder, toggle, ubah warna, dan langsung terlihat di showcase publik

## Fase 4: Listings (Product & Commission)

- [ ] Buat remote functions: `createListing`, `updateListing`, `deleteListing`, `getListingsByArtist`
- [ ] Buat dashboard halaman `listings/` — list, create, edit
- [ ] Handle upload gambar listing ke Supabase Storage
- [ ] Integrasikan listing ke `ShopGrid` section di showcase publik
- [ ] Integrasikan commission rate ke `CommissionRates` section

## Fase 5: Orders & Payment (Semi-Manual)

- [ ] Buat halaman checkout `/checkout/[listingId]`
- [ ] Buat remote functions: `createOrder`, `uploadPaymentProof`, `confirmPayment`
- [ ] Setup Supabase Storage bucket khusus bukti bayar (private, bukan public)
- [ ] Buat dashboard `orders/` — list order masuk buat artist, dengan status filter
- [ ] Buat detail order page — artist bisa lihat bukti bayar & konfirmasi
- [ ] Setup notifikasi WA (pakai `wa.me` link generator, minimal effort dulu)
- [ ] Buat flow khusus commission: brief note → nego (manual via WA dulu) → agreed_price diisi manual oleh artist → lanjut ke payment
- [ ] Test end-to-end: buyer order → upload bukti → artist confirm → status completed

## Fase 6: Testimonial & Polish

- [ ] Buat remote function: `submitTestimonial` (cuma bisa kalau order status = completed)
- [ ] Tampilkan testimonial di showcase publik
- [ ] Buat landing page marketing (`(marketing)` route group)
- [ ] Responsive check — semua showcase & dashboard di mobile
- [ ] Draft ToS & privacy policy sederhana (soal liability transaksi manual)
- [ ] Setup custom domain (kalau nanti upgrade dari `.vercel.app`)
- [ ] Final review: performance check (Vercel free tier limits), error handling edge cases

---

## Backlog (Bukan v1, buat nanti)

- [ ] Migrasi payment ke payment gateway (Midtrans/Xendit)
- [ ] Level 3 showcase builder (true drag-drop canvas)
- [ ] In-app chat buat brief commission (gantiin WA manual)
- [ ] Multi-image gallery lightbox
- [ ] Search & filter artist di landing page
