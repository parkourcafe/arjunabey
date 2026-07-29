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
 * TODO(owner): a public guest mailbox on the brand's own domain. Enquiries are
 * currently routed by ENQUIRY_TO, which is deliberately not published here —
 * a personal address in the footer undercuts the brand it is meant to carry.
 */
export const OPERATOR = {
  name: 'CV FDR Hospitality Operations',
  /** TODO(owner): brand domain, once the address is settled. */
  website: null as string | null,
  /** TODO(owner): public guest mailbox. Null hides the mailto link. */
  email: null as string | null,
  officeHours: [
    { days: 'Monday–Friday', hours: '09:00–18:00' },
    { days: 'Saturday–Sunday', hours: 'Closed' },
  ],
} as const;
