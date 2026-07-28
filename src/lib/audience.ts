/**
 * audience.ts — who a villa actually suits, derived from its own data.
 *
 * The three segments come from the go-to-market research (Anjuna_GTM_Strategy,
 * "The first 3 target segments"): couples/honeymooners, surfers, and
 * long-stay/remote workers. They are not invented personas — they are the
 * audiences the estate already draws.
 *
 * Everything below is derived from fields that exist in the content
 * (bedrooms, maximumGuests, amenities). Nothing is asserted that a villa's
 * own frontmatter does not support, so a villa can never advertise a fit it
 * does not have — CLAUDE.md rule 6.
 */

export interface Audience {
  id: 'couples' | 'families' | 'surfers' | 'longstay';
  label: string;
  /** One line, guest-facing. */
  note: string;
}

export interface AudienceInput {
  bedrooms: number;
  maximumGuests: number;
  amenities: string[];
  walkTimes: Record<string, number>;
}

const has = (amenities: string[], needle: string) =>
  amenities.some((a) => a.toLowerCase().includes(needle));

/**
 * Ordered best-fit first. The lead entry is what a card shows; a villa page
 * shows the full set.
 */
export function audiencesFor(villa: AudienceInput): Audience[] {
  const { bedrooms, maximumGuests, amenities, walkTimes } = villa;
  const out: Audience[] = [];

  const beachMinutes = Math.min(...Object.values(walkTimes ?? {}), Infinity);
  const walkable = Number.isFinite(beachMinutes) && beachMinutes <= 10;
  const workspace = has(amenities, 'workspace') || has(amenities, 'desk');

  if (bedrooms === 1) {
    out.push({
      id: 'couples',
      label: 'Couples & honeymooners',
      note: 'A private pool, a locked gate and nobody else on the property — the reason most guests come to this side of the Bukit.',
    });
  } else {
    out.push({
      id: 'families',
      label: bedrooms >= 3 ? 'Families & groups' : 'Two couples or a family',
      note: `${bedrooms} bedrooms and space for ${maximumGuests}, with a kitchen for the meals you would rather eat in.`,
    });
  }

  if (walkable) {
    out.push({
      id: 'surfers',
      label: 'Surfers',
      note: `${beachMinutes} minutes on foot to the sand, with Padang Padang, Bingin and Impossibles a short ride further.`,
    });
  }

  if (workspace) {
    out.push({
      id: 'longstay',
      label: 'Long stays & remote work',
      note: 'A dedicated workspace and fast fibre, with a reduced nightly rate from seven nights.',
    });
  }

  return out;
}

/** The single best-fit label, for cards and listings. */
export function leadAudience(villa: AudienceInput): string | null {
  return audiencesFor(villa)[0]?.label ?? null;
}
