/**
 * JSON-LD builders — one function per schema.org type used on the site
 * (docs/BUILD.md §9/§13). Each returns a plain object; SeoHead.astro
 * JSON.stringifies it into a <script type="application/ld+json"> tag.
 *
 * Keep these pure (no fetching) — callers pass in already-loaded content-
 * collection entries so this file stays trivially unit-testable.
 */

import { OPERATOR } from './operator';
import { whatsappNumber } from './whatsapp';
import { siteUrl } from './site';

const SITE_NAME = 'Anjuna Bay';
const SITE_URL = siteUrl();

export interface VillaLike {
  landmarkName: string;
  bedrooms: number;
  ratePublic: number | null;
  currency: string;
  rating: number | null;
  reviewCount: number | null;
  heroImageUrl: string;
}

export function lodgingBusiness() {
  const phone = whatsappNumber();
  return {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    name: SITE_NAME,
    url: SITE_URL,
    description:
      'Cliffside pool villas above Thomas Beach, Uluwatu — the view, the pool and the quiet, a short walk from the sand.',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Uluwatu, Pecatu',
      addressRegion: 'Bali',
      addressCountry: 'ID',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'reservations',
      email: OPERATOR.email,
      url: OPERATOR.website,
      ...(phone ? { telephone: `+${phone}` } : {}),
    },
    // TODO: real aggregate figures come from the Guesty/OTA export — do not
    // hand-set these; only render this block once real data is wired in.
  };
}

/**
 * Deliberately NOT emitted into structured data.
 *
 * Our ratings come from the villas' Airbnb listings. Google's review-snippet
 * policy requires that a marked-up rating be collected by the site itself and
 * be visible on the page it describes; marking up a rating gathered by another
 * platform is grounds for a manual action against the domain. That risk lands
 * on whatever domain this brand ends up on, so the block stays out of JSON-LD.
 *
 * The rating is still shown to guests — see RatingBadge.astro — with the
 * source named. Showing an OTA rating is fine; claiming it as our own
 * structured data is not. Once reviews are collected first-party, this can
 * come back.
 */
export function vacationRental(villa: VillaLike, canonicalUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'VacationRental',
    name: `${villa.landmarkName} — ${villa.bedrooms}-Bedroom Pool Villa`,
    url: canonicalUrl,
    image: villa.heroImageUrl,
    numberOfBedrooms: villa.bedrooms,
    ...(villa.ratePublic
      ? {
          offers: {
            '@type': 'Offer',
            price: villa.ratePublic,
            priceCurrency: villa.currency,
          },
        }
      : {}),
  };
}

export function article(opts: {
  title: string;
  description: string;
  imageUrl: string;
  author: string;
  datePublished: string; // ISO
  canonicalUrl: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: opts.title,
    description: opts.description,
    image: opts.imageUrl,
    author: { '@type': 'Organization', name: opts.author },
    datePublished: opts.datePublished,
    mainEntityOfPage: opts.canonicalUrl,
    publisher: { '@type': 'Organization', name: SITE_NAME },
  };
}

export function faqPage(items: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((i) => ({
      '@type': 'Question',
      name: i.question,
      acceptedAnswer: { '@type': 'Answer', text: i.answer },
    })),
  };
}

export function breadcrumbList(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function itemList(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      url: item.url,
    })),
  };
}

export function canonicalFor(pathname: string): string {
  return new URL(pathname, SITE_URL).toString();
}
