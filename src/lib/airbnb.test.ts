import { describe, expect, it } from "vitest";
import { airbnbBookingUrl, airbnbListingUrl } from "./airbnb";

describe("Airbnb booking links", () => {
  it("returns the verified listing for a published villa", () => {
    expect(airbnbListingUrl("aruna-2-bedroom-pool-villa")).toBe(
      "https://www.airbnb.com/rooms/1528739961249716034",
    );
  });

  it("returns null for an unknown villa", () => {
    expect(airbnbListingUrl("unknown-villa")).toBeNull();
  });

  it("passes selected dates and guests into the self-serve booking flow", () => {
    const result = new URL(
      airbnbBookingUrl("https://www.airbnb.com/rooms/1528739961249716034", {
        checkIn: "2026-09-07",
        checkOut: "2026-09-14",
        guests: 4,
      }),
    );
    expect(result.searchParams.get("check_in")).toBe("2026-09-07");
    expect(result.searchParams.get("check_out")).toBe("2026-09-14");
    expect(result.searchParams.get("guests")).toBe("4");
    expect(result.searchParams.get("adults")).toBe("4");
  });
});
