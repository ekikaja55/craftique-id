per-tabel dengan tipe data (asumsi Postgres via Supabase + Drizzle ORM).

---

## 1. `users`
*Base identity — sebenarnya sebagian besar di-handle Supabase Auth (`auth.users`), ini tabel profile tambahan yang link ke situ.*

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | uuid (PK, FK ke `auth.users.id`) | |
| `email` | text | dari Supabase Auth |
| `role` | enum: `artist`, `buyer`, `admin` | default `buyer` |
| `display_name` | text | |
| `avatar_url` | text | nullable |
| `created_at` | timestamp | |

---

## 2. `artist_profiles`
*Data tambahan khusus buat user yang jadi artist.*

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | uuid (PK) | |
| `user_id` | uuid (FK → `users.id`, unique) | |
| `slug` | text (unique) | buat URL `/artist/[slug]` |
| `bio` | text | nullable |
| `wa_number` | text | buat kontak/notif |
| `payment_info` | jsonb | `{ bank_name, account_number, qris_url }` — array kalau mau multi metode |
| `is_published` | boolean | showcase visible publik atau masih draft |
| `created_at` | timestamp | |

---

## 3. `showcases`
*Config utama showcase per-artist — 1:1 dengan `artist_profiles`.*

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | uuid (PK) | |
| `artist_id` | uuid (FK → `artist_profiles.id`, unique) | |
| `template_id` | text | referensi ke salah satu dari 3-4 template layout preset |
| `theme_color` | text | hex code, dari color picker |
| `updated_at` | timestamp | |

---

## 4. `showcase_sections`
*Instance komponen yang dipasang + urutannya — ini jantung dari section-builder.*

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | uuid (PK) | |
| `showcase_id` | uuid (FK → `showcases.id`) | |
| `type` | enum: `hero`, `about`, `gallery`, `shop`, `commission_rates`, `testimonial`, `faq`, `social_links`, `contact_wa` | 9 komponen yang udah kita sepakati |
| `order_index` | integer | posisi urutan (buat drag-reorder) |
| `is_visible` | boolean | toggle on/off tanpa hapus data |
| `config` | jsonb | isi spesifik per-tipe komponen, contoh di bawah |

**Contoh isi `config` per-type** (fleksibel karena jsonb):
```json
// type: hero
{ "banner_url": "...", "tagline": "Digital Illustrator & Concept Artist" }

// type: faq
{ "items": [{ "q": "Berapa lama proses komisi?", "a": "3-7 hari kerja" }] }

// type: social_links
{ "links": [{ "platform": "instagram", "url": "..." }] }
```

---

## 5. `listings`
*Product & commission, satu tabel seperti yang kita sepakati.*

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | uuid (PK) | |
| `artist_id` | uuid (FK → `artist_profiles.id`) | |
| `type` | enum: `product`, `commission` | |
| `title` | text | |
| `description` | text | |
| `price` | numeric | nullable kalau commission pakai range |
| `price_note` | text | nullable, misal "mulai dari" atau "nego sesuai brief" |
| `images` | jsonb (array of url) | |
| `status` | enum: `active`, `inactive`, `sold_out` | |
| `created_at` | timestamp | |

---

## 6. `orders`
*Transaksi antara buyer-artist, nampung flow product maupun commission.*

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | uuid (PK) | |
| `buyer_id` | uuid (FK → `users.id`) | |
| `artist_id` | uuid (FK → `artist_profiles.id`) | |
| `listing_id` | uuid (FK → `listings.id`) | |
| `status` | enum: `pending_brief` (khusus commission), `pending_payment`, `proof_uploaded`, `confirmed`, `in_progress`, `completed`, `cancelled` | |
| `agreed_price` | numeric | final price, terutama penting buat commission setelah nego |
| `brief_note` | text | nullable, buat commission — request detail dari buyer |
| `created_at` | timestamp | |
| `updated_at` | timestamp | |

---

## 7. `payment_proofs`
*Bukti bayar yang diupload buyer.*

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | uuid (PK) | |
| `order_id` | uuid (FK → `orders.id`) | |
| `proof_url` | text | dari Supabase Storage |
| `uploaded_at` | timestamp | |
| `confirmed_by_artist` | boolean | default false, artist toggle setelah cek manual |
| `confirmed_at` | timestamp | nullable |

---

## 8. `testimonials`
*Review, linked ke order yang completed — biar gak bisa review sembarangan tanpa transaksi.*

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | uuid (PK) | |
| `order_id` | uuid (FK → `orders.id`, unique) | satu order cuma bisa 1 review |
| `rating` | integer | 1-5 |
| `comment` | text | nullable |
| `created_at` | timestamp | |

---

## Catatan penting soal RLS (Row Level Security)

Karena kamu pakai Supabase, ini bukan cuma soal skema tapi juga **siapa boleh akses apa** — beberapa aturan yang perlu kamu terapkan nanti:
- Artist cuma bisa `UPDATE`/`DELETE` `showcases`, `showcase_sections`, `listings` miliknya sendiri (`WHERE artist_id = auth.uid()`)
- Buyer cuma bisa lihat `orders` & `payment_proofs` miliknya sendiri
- `payment_info` di `artist_profiles` sebaiknya **tidak** publicly readable — cuma exposed ke buyer yang punya order aktif ke artist itu (bukan lewat showcase page publik)

---

Skema ini udah cukup buat v1. Lanjut ke **struktur direktori project** sekarang (SvelteKit + Drizzle + folder organisasi)?
