/**
 * The entity that will run guest operations, and the channels a guest can
 * actually reach. One place, so contact pages, footer copy and structured data
 * cannot drift apart.
 *
 * This previously named Balinest Villas — the incumbent operator — and
 * published their mailbox as the site's contact. On a site whose purpose is to
 * propose a different operator, that advertised the incumbent.
 *
 * NOTE ON THE WHATSAPP NUMBER. It is the developer's property-sales line, not
 * a dedicated guest line. Confirmed for use anyway, so the prefilled message
 * says up front that the sender is a guest asking about a stay — whoever picks
 * it up will otherwise read it as a purchase enquiry.
 *
 * TODO(owner): a guest mailbox on the brand's own domain. The published
 * address is a personal one, shown at the owner's instruction so there is a
 * visible contact for the meeting. Swap it the moment brand DNS exists.
 */
export const OPERATOR = {
  name: 'CV FDR Hospitality',
  /**
   * Named because a privacy notice has to say who is accountable for the
   * personal data the enquiry form collects — "the property team" is not a
   * person anyone can write to.
   */
  principal: 'Fadjri D. Roesman',
  /** TODO(owner): registered address of the CV, for the privacy notice. */
  registeredAddress: null as string | null,
  /** TODO(owner): brand domain, once the address is settled. */
  website: null as string | null,
  /** Published contact. Same address the enquiry form delivers to. */
  email: 'saidalarust@gmail.com' as string | null,
  officeHours: [
    { days: 'Monday–Friday', hours: '09:00–18:00' },
    { days: 'Saturday–Sunday', hours: 'Closed' },
  ],
} as const;
