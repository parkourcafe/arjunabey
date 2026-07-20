/**
 * JSON-LD builders — one function per schema.org type used on the site
 * (docs/BUILD.md §9/§13). Each returns a plain object; SeoHead.astro
 * JSON.stringifies it into a <script type="application/ld+json"> tag.
 *
 * Keep these pure (no fetching) — callers pass in already-loaded content-
 * collection entries so this file stays trivially unit-testable.
 */

const SITE_NAME = 'Anjuna Bay';
const SITE_URL = 'https://anjunabay.com'; // TODO: confirm final domain (docs/BUILD.md §14)

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
    // TODO: real aggregate figures come from the Guesty/OTA export — do not
    // hand-set these; only render this block once real data is wired in.
  };
}

export function aggregateRating(rating: number | null, reviewCount: number | null) {
  if (!rating || !reviewCount) return null; // never fabricate — omit the block entirely
  return {
    '@type': 'AggregateRating',
    ratingValue: rating,
    reviewCount,
    bestRating: 5,
  };
}

export function vacationRental(villa: VillaLike, canonicalUrl: string) {
  const rating = aggregateRating(villa.rating, villa.reviewCount);
  return {
    '@context': 'https://schema.org',
    '@type': 'VacationRental',
    name: `${villa.landmarkName} — ${villa.bedrooms}-Bedroom Pool Villa`,
    url: canonicalUrl,
    image: villa.heroImageUrl,
    numberOfBedrooms: villa.bedrooms,
    ...(rating ? { aggregateRating: rating } : {}),
    ...(villa.ratePublic
      ? {
          offers: {
            '@type': 'Offer',
            price: villa.ratePublic,
            priceCurrency: villa.currency,
            availability: 'https://schema.org/InStock',
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
