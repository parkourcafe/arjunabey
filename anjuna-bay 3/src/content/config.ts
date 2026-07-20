/**
 * Content Collections schema — the single source of truth for content shape.
 * No CMS: content lives as MDX + frontmatter under src/content/**, validated
 * by Zod at build time. See docs/BUILD.md §4 and CLAUDE.md "golden rules".
 *
 * HARD RULES enforced by this schema (do not weaken these when editing):
 * - status: 'live' is the ONLY thing that may render as bookable (confirmed
 *   owner mandate + licence + handover — see 01_Promotion_Strategy_RU.md §6).
 * - ratePublic / guestyUnitId / rating / reviewCount are all nullable.
 *   A missing real value must be `null`, never a guessed number. Components
 *   consuming these fields must handle null (see src/lib/guesty.ts,
 *   RateBlock.astro) — never fake a price or a review to fill a gap.
 */
import { defineCollection, z } from 'astro:content';

const seo = z
  .object({
    title: z.string(),
    description: z.string(),
    ogImage: z.string().optional(),
  })
  .partial();

const villas = defineCollection({
  type: 'content',
  schema: ({ image }) =>
    z.object({
      landmarkName: z.string(), // "Sunset" — never a unit code ("B10") anywhere guest-facing
      status: z.enum(['live', 'off-plan']).default('off-plan'),
      bedrooms: z.number().int().positive(),
      bathrooms: z.number().int().positive().optional(),
      view: z.string().default('ocean'),
      sizeSqm: z.number().positive().optional(),
      walkTimes: z.record(z.string(), z.number()).default({}), // { thomasBeach: 5, padangPadang: 12 }
      amenities: z.array(z.string()).default([]),
      includes: z.array(z.string()).default([]), // "airport transfer", "daily housekeeping"

      // Pricing — ratePublic must never be set below the OTA public rate (parity).
      // null renders "Enquire for rates" rather than a guessed figure.
      ratePublic: z.number().positive().nullable().default(null),
      freeCancelRate: z.number().positive().nullable().optional(),
      currency: z.string().default('USD'),

      // null → booking CTA falls back to WhatsApp (src/lib/guesty.ts bookingLink()).
      guestyUnitId: z.string().nullable().default(null),

      rating: z.number().min(0).max(5).nullable().optional(),
      reviewCount: z.number().int().nonnegative().nullable().optional(),

      quietForDates: z.boolean().default(false),
      // Required: every villa discloses construction/nightlife honestly (CLAUDE.md rule 4).
      goodToKnow: z.string().min(1),

      heroImage: image(),
      gallery: z.array(image()).default([]),
      video: z.string().url().nullable().optional(),

      order: z.number().default(0), // manual sort weight for the collection grid
      seo: seo.optional(),
    }),
});

const experiences = defineCollection({
  type: 'content',
  schema: ({ image }) =>
    z.object({
      category: z.enum(['surf', 'wellness', 'dining', 'celebrations', 'around-uluwatu']),
      title: z.string(),
      excerpt: z.string(),
      heroImage: image(),
      relatedVillas: z.array(z.string()).default([]), // villa slugs
      order: z.number().default(0),
      seo: seo.optional(),
    }),
});

const journal = defineCollection({
  type: 'content',
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      excerpt: z.string(),
      heroImage: image(),
      category: z.string(),
      author: z.string().default('Anjuna Bay'),
      date: z.coerce.date(),
      relatedVillas: z.array(z.string()).default([]),
      seo: seo.optional(),
    }),
});

const offers = defineCollection({
  type: 'content',
  schema: () =>
    z.object({
      title: z.string(),
      segment: z.string(),
      terms: z.string(),
      cta: z.string().default('Reserve'),
      active: z.boolean().default(true),
      seo: seo.optional(),
    }),
});

const pages = defineCollection({
  type: 'content',
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      heroImage: image().optional(),
      seo: seo.optional(),
    }),
});

export const collections = { villas, experiences, journal, offers, pages };
