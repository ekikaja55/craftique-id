import { pgTable, pgEnum, uuid, text, boolean, integer, numeric, jsonb, timestamp } from 'drizzle-orm/pg-core';

// ── Enums ─────────────────────────────────────────────
export const userRoleEnum = pgEnum('user_role', ['artist', 'buyer', 'admin']);
export const listingTypeEnum = pgEnum('listing_type', ['product', 'commission']);
export const listingStatusEnum = pgEnum('listing_status', ['active', 'inactive', 'sold_out']);
export const sectionTypeEnum = pgEnum('section_type', [
  'hero',
  'about',
  'gallery',
  'shop',
  'commission_rates',
  'testimonial',
  'faq',
  'social_links',
  'contact_wa'
]);
export const orderStatusEnum = pgEnum('order_status', [
  'pending_brief',
  'pending_payment',
  'proof_uploaded',
  'confirmed',
  'in_progress',
  'completed',
  'cancelled'
]);

// ── Users ─────────────────────────────────────────────
// id disamakan dengan auth.users.id dari Supabase Auth (bukan auto-generate di sini)
export const users = pgTable('users', {
  id: uuid('id').primaryKey(),
  email: text('email').notNull(),
  role: userRoleEnum('role').notNull().default('buyer'),
  displayName: text('display_name'),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at').notNull().defaultNow()
});

// ── Artist Profiles ───────────────────────────────────
export const artistProfiles = pgTable('artist_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: 'cascade' }),
  slug: text('slug').notNull().unique(),
  bio: text('bio'),
  waNumber: text('wa_number'),
  paymentInfo: jsonb('payment_info').$type<{
    bankName?: string;
    accountNumber?: string;
    qrisUrl?: string;
  }>(),
  isPublished: boolean('is_published').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow()
});

// ── Showcases ─────────────────────────────────────────
export const showcases = pgTable('showcases', {
  id: uuid('id').primaryKey().defaultRandom(),
  artistId: uuid('artist_id')
    .notNull()
    .unique()
    .references(() => artistProfiles.id, { onDelete: 'cascade' }),
  templateId: text('template_id').notNull().default('default'),
  themeColor: text('theme_color').notNull().default('#000000'),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

// ── Showcase Sections ─────────────────────────────────
export const showcaseSections = pgTable('showcase_sections', {
  id: uuid('id').primaryKey().defaultRandom(),
  showcaseId: uuid('showcase_id')
    .notNull()
    .references(() => showcases.id, { onDelete: 'cascade' }),
  type: sectionTypeEnum('type').notNull(),
  orderIndex: integer('order_index').notNull().default(0),
  isVisible: boolean('is_visible').notNull().default(true),
  config: jsonb('config').notNull().default({})
});

// ── Listings (Product & Commission) ───────────────────
export const listings = pgTable('listings', {
  id: uuid('id').primaryKey().defaultRandom(),
  artistId: uuid('artist_id')
    .notNull()
    .references(() => artistProfiles.id, { onDelete: 'cascade' }),
  type: listingTypeEnum('type').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  price: numeric('price', { precision: 12, scale: 2 }),
  priceNote: text('price_note'),
  images: jsonb('images').$type<string[]>().notNull().default([]),
  status: listingStatusEnum('status').notNull().default('active'),
  createdAt: timestamp('created_at').notNull().defaultNow()
});

// ── Orders ─────────────────────────────────────────────
export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  buyerId: uuid('buyer_id')
    .notNull()
    .references(() => users.id, { onDelete: 'restrict' }),
  artistId: uuid('artist_id')
    .notNull()
    .references(() => artistProfiles.id, { onDelete: 'restrict' }),
  listingId: uuid('listing_id')
    .notNull()
    .references(() => listings.id, { onDelete: 'restrict' }),
  status: orderStatusEnum('status').notNull().default('pending_payment'),
  agreedPrice: numeric('agreed_price', { precision: 12, scale: 2 }),
  briefNote: text('brief_note'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

// ── Payment Proofs ─────────────────────────────────────
export const paymentProofs = pgTable('payment_proofs', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id')
    .notNull()
    .references(() => orders.id, { onDelete: 'cascade' }),
  proofUrl: text('proof_url').notNull(),
  uploadedAt: timestamp('uploaded_at').notNull().defaultNow(),
  confirmedByArtist: boolean('confirmed_by_artist').notNull().default(false),
  confirmedAt: timestamp('confirmed_at')
});

// ── Testimonials ────────────────────────────────────────
export const testimonials = pgTable('testimonials', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id')
    .notNull()
    .unique()
    .references(() => orders.id, { onDelete: 'cascade' }),
  rating: integer('rating').notNull(),
  comment: text('comment'),
  createdAt: timestamp('created_at').notNull().defaultNow()
});
