/**
 * estate.ts — the verified facts about the wider Anjuna Bay development.
 *
 * SOURCING. Everything here is traceable, because guest-facing numbers may not
 * be invented (CLAUDE.md rule 6):
 *   [DEV]  theanjunabay.com, the developer's own site — the 8.5-hectare
 *          cliff-front community, direct Thomas Beach access, and the
 *          residential/retail/wellness/leisure programme.
 *   [DECK] Anjuna_Full_Deck (Selena Systems, Jul 2026), slide 4 — estate
 *          composition and build status per cluster.
 *   [OTA]  Anjuna_Metrics — published guest ratings and review counts.
 *
 * DELIBERATELY ABSENT, and why:
 *   · occupancy (~85%) — an operator claim, unverified (deck slides 7, 10)
 *   · the $66 1BR baseline — one low-confidence snippet, marked unverified
 *   · the 17.54% ROI figure — investment marketing; the guest brand carries no
 *     property-sales content (CLAUDE.md rule 5)
 *   · per-villa floor area — not recorded in any villa's frontmatter
 *     TODO(estate): add sizeSqm per villa once measured, then surface it.
 */

export interface EstateFact {
  value: string;
  label: string;
  /** Shown as a footnote where the honest answer needs a qualifier. */
  note?: string;
}

/** Headline figures for the estate, safe to state. */
export const ESTATE_FACTS: EstateFact[] = [
  { value: '8.5 ha', label: 'Cliff-front community at Thomas Beach' },
  { value: '3 min', label: "On foot to the sand from the villas we let" },
  { value: '4.87–5.0★', label: 'Guest rating across the villas' },
  { value: '9.5', label: 'Staff score on Booking.com' },
];

/**
 * How the wider development is composed. Build status is stated plainly —
 * several clusters are not finished, and saying so is the point
 * (CLAUDE.md rule 4).
 */
export const ESTATE_CLUSTERS = [
  {
    name: 'Surf & Sunset',
    detail: 'The cliffside pool villas — one, two and three bedrooms',
    status: 'Built and operating',
  },
  {
    name: 'Aurora',
    detail: '32 villas, made to order',
    status: 'Off-plan',
  },
  {
    name: 'Palms',
    detail: '15 townhouses',
    status: 'In handover',
  },
  {
    name: 'Urbana',
    detail: '22 apartments',
    status: 'From late 2026',
  },
];

/**
 * What the community provides. The developer describes a full-circle
 * programme — residential, retail, wellness and leisure. Parts of it are
 * still being built, so each line says where it stands rather than implying
 * everything is open today.
 */
export const ESTATE_AMENITIES = [
  { label: 'Direct access to Thomas Beach', status: 'open' as const },
  { label: 'Gated, private grounds', status: 'open' as const },
  { label: 'A private pool with every villa', status: 'open' as const },
  { label: 'Fibre internet throughout', status: 'open' as const },
  { label: 'Wellness and fitness facilities', status: 'planned' as const },
  { label: 'Retail and leisure spaces', status: 'planned' as const },
];
