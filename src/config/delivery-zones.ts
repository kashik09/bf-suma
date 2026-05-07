/**
 * Delivery zones configuration for BF Suma Uganda
 *
 * Zone-based shipping fees for Kampala and surrounding areas.
 * Prices are in minor units (UGX).
 */

export interface DeliveryZone {
  id: string;
  name: string;
  coverage: string;
  feeMinor: number;
  estimate: string;
}

export const DELIVERY_ZONES: DeliveryZone[] = [
  {
    id: "central",
    name: "Central Kampala",
    coverage: "CBD, Nakasero, Kololo, Bugolobi, Wandegeya, Makerere, Kamwokya",
    feeMinor: 5000,
    estimate: "Same-day if before 12 PM"
  },
  {
    id: "greater",
    name: "Greater Kampala",
    coverage: "Ntinda, Bukoto, Kisaasi, Naalya, Kira, Najjera, Namugongo, Kyaliwajjala, Banda, Mbuya",
    feeMinor: 10000,
    estimate: "Same-day or next day"
  },
  {
    id: "outskirts",
    name: "Kampala Outskirts",
    coverage: "Mukono, Wakiso, Entebbe, Gayaza, Bweyogerere, Kajjansi, Seeta, Kyengera, Bulenga",
    feeMinor: 15000,
    estimate: "1-2 business days"
  },
  {
    // Bus parcel service — customer collects from local bus park
    id: "upcountry",
    name: "Outside Kampala",
    coverage: "Jinja, Mbarara, Gulu, Masaka, Fort Portal, Mbale, Arua and other upcountry areas",
    feeMinor: 10000,
    estimate: "24-48 hours via bus parcel"
  }
];

export const DEFAULT_ZONE_ID = "central";

export function getZoneById(zoneId: string): DeliveryZone | undefined {
  return DELIVERY_ZONES.find((zone) => zone.id === zoneId);
}

export function getDeliveryFeeForZone(zoneId: string): number {
  const zone = getZoneById(zoneId);
  return zone?.feeMinor ?? DELIVERY_ZONES[0].feeMinor;
}

export function computeZoneDeliveryFee(
  isPickup: boolean,
  zoneId: string
): number {
  if (isPickup) return 0;
  return getDeliveryFeeForZone(zoneId);
}

export function getDeliveryEstimate(isPickup: boolean, zoneId: string): string {
  if (isPickup) {
    return "Ready for pickup today or next business day";
  }
  const zone = getZoneById(zoneId);
  return zone?.estimate ?? "1-2 business days";
}
