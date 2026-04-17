const WISHLIST_STORAGE_KEY = "bf-suma-wishlist";
export const WISHLIST_UPDATED_EVENT = "bf_suma_wishlist_updated";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function normalizeSlug(slug: string): string {
  return slug.trim();
}

function normalizeWishlist(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];

  const seen = new Set<string>();
  const normalized: string[] = [];

  raw.forEach((value) => {
    if (typeof value !== "string") return;
    const slug = normalizeSlug(value);
    if (!slug || seen.has(slug)) return;
    seen.add(slug);
    normalized.push(slug);
  });

  return normalized;
}

function readWishlistStorage(): string[] {
  if (!canUseStorage()) return [];

  try {
    const raw = window.localStorage.getItem(WISHLIST_STORAGE_KEY);
    if (!raw) return [];
    return normalizeWishlist(JSON.parse(raw));
  } catch {
    return [];
  }
}

function writeWishlistStorage(slugs: string[]) {
  if (!canUseStorage()) return;

  const normalized = normalizeWishlist(slugs);
  window.localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(normalized));
  window.dispatchEvent(new Event(WISHLIST_UPDATED_EVENT));
}

export function getWishlist(): string[] {
  return readWishlistStorage();
}

export function addToWishlist(slug: string): void {
  const normalized = normalizeSlug(slug);
  if (!normalized) return;

  const current = readWishlistStorage();
  if (current.includes(normalized)) return;

  writeWishlistStorage([...current, normalized]);
}

export function removeFromWishlist(slug: string): void {
  const normalized = normalizeSlug(slug);
  if (!normalized) return;

  const current = readWishlistStorage();
  writeWishlistStorage(current.filter((entry) => entry !== normalized));
}

export function isInWishlist(slug: string): boolean {
  const normalized = normalizeSlug(slug);
  if (!normalized) return false;

  return readWishlistStorage().includes(normalized);
}

export function toggleWishlist(slug: string): boolean {
  const normalized = normalizeSlug(slug);
  if (!normalized) return false;

  const current = readWishlistStorage();
  if (current.includes(normalized)) {
    writeWishlistStorage(current.filter((entry) => entry !== normalized));
    return false;
  }

  writeWishlistStorage([...current, normalized]);
  return true;
}

export function clearWishlist(): void {
  writeWishlistStorage([]);
}
