/**
 * Delivery zones configuration for BF Suma Uganda
 *
 * Zone-based shipping fees for Kampala and surrounding areas.
 * Prices are in minor units (UGX).
 */

export interface DeliveryZone {
  id: string;
  name: string;
  description: string;
  feeMinor: number;
  estimateDays: string;
}

export const DELIVERY_ZONES: DeliveryZone[] = [
  {
    id: "central",
    name: "Central Kampala",
    description: "City center, Old Kampala, Nakasero, Kololo, Kamwokya",
    feeMinor: 5000,
    estimateDays: "Same day"
  },
  {
    id: "greater",
    name: "Greater Kampala",
    description: "Ntinda, Bukoto, Kisaasi, Naalya, Kira, Najjera, Namugongo",
    feeMinor: 7000,
    estimateDays: "Same day or next day"
  },
  {
    id: "outskirts",
    name: "Kampala Outskirts",
    description: "Mukono, Wakiso, Entebbe, Gayaza, Bweyogerere",
    feeMinor: 10000,
    estimateDays: "1-2 days"
  }
];

export const DEFAULT_ZONE_ID = "central";
export const DELIVERY_FEE_WAIVER_SUBTOTAL_MINOR = 50000;

export function getZoneById(zoneId: string): DeliveryZone | undefined {
  return DELIVERY_ZONES.find((zone) => zone.id === zoneId);
}

export function getDeliveryFeeForZone(zoneId: string): number {
  const zone = getZoneById(zoneId);
  return zone?.feeMinor ?? DELIVERY_ZONES[0].feeMinor;
}

export function computeZoneDeliveryFee(
  subtotal: number,
  isPickup: boolean,
  zoneId: string
): number {
  if (isPickup) return 0;
  if (subtotal >= DELIVERY_FEE_WAIVER_SUBTOTAL_MINOR) return 0;
  return getDeliveryFeeForZone(zoneId);
}

export function getDeliveryEstimate(isPickup: boolean, zoneId: string): string {
  if (isPickup) {
    return "Ready for pickup today or next business day";
  }
  const zone = getZoneById(zoneId);
  return zone ? `Arrives: ${zone.estimateDays}` : "Arrives: 1-2 days";
}
