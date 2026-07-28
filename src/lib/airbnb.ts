/**
 * Verified public Airbnb listing URLs for the published Anjuna inventory.
 *
 * Source: docs/ANJUNA_VILLA_NAME_MAP.csv. These links provide the current
 * self-serve availability, fee, cancellation and payment flow until the
 * estate's Guesty booking engine is connected.
 */
const LISTING_IDS: Record<string, string> = {
  "reef-1-bedroom-pool-villa": "1531033065415432151",
  "sol-1-bedroom-pool-villa": "1535960403199389719",
  "nalu-1-bedroom-pool-villa": "1528696130381899937",
  "marea-1-bedroom-pool-villa": "1533702275809293491",
  "sora-1-bedroom-pool-villa": "1533697045766713735",
  "luma-1-bedroom-pool-villa": "1530353930561224901",
  "cove-1-bedroom-pool-villa": "1530361440129666958",
  "tide-1-bedroom-pool-villa": "1528724193523513788",
  "dune-1-bedroom-pool-villa": "1647076484277431363",
  "halo-1-bedroom-pool-villa": "1650058710181211040",
  "sunset-2-bedroom-pool-villa": "1528729828057732276",
  "karang-2-bedroom-pool-villa": "1533707128133724727",
  "aruna-2-bedroom-pool-villa": "1528739961249716034",
  "selene-2-bedroom-pool-villa": "1528745688294974781",
  "calma-2-bedroom-pool-villa": "1528749163289022085",
  "neru-2-bedroom-pool-villa": "1647106754271921496",
  "aster-2-bedroom-pool-villa": "1668931400941321216",
  "maris-2-bedroom-pool-villa": "1656184499485537054",
  "terra-2-bedroom-pool-villa": "1652945111885072519",
  "elara-2-bedroom-pool-villa": "1650052385341505024",
  "vela-2-bedroom-pool-villa": "1650041864570731631",
  "horizon-3-bedroom-pool-villa": "1538886139016357544",
  "meridian-3-bedroom-pool-villa": "1538877998571031981",
};

export function airbnbListingUrl(slug: string): string | null {
  const listingId = LISTING_IDS[slug];
  return listingId ? `https://www.airbnb.com/rooms/${listingId}` : null;
}

export function airbnbBookingUrl(
  listingUrl: string,
  options: { checkIn?: string; checkOut?: string; guests?: number } = {},
): string {
  const url = new URL(listingUrl);
  if (options.checkIn) url.searchParams.set("check_in", options.checkIn);
  if (options.checkOut) url.searchParams.set("check_out", options.checkOut);
  if (options.guests) {
    url.searchParams.set("guests", String(options.guests));
    url.searchParams.set("adults", String(options.guests));
  }
  return url.toString();
}
