import { Property } from "../services/publicApi";

const RENDER_COUNT = 42;

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

export function getPlaceholderImage(seed?: string | number | null): string {
  if (!seed) return "/renders/7.jpg";
  const numericSeed = typeof seed === "number" ? seed : hashString(seed);
  const index = Math.abs(numericSeed % RENDER_COUNT) + 1;
  return `/renders/${index}.jpg`;
}

export function getPropertyCover(property?: Property | null): string {
  if (property?.images?.[0]) return property.images[0];
  return getPlaceholderImage(property?.reference || property?.title || property?.id);
}

export function getPropertyGallery(property?: Property | null): string[] {
  if (property?.images?.length) return property.images;
  return [getPlaceholderImage(property?.reference || property?.title || property?.id)];
}
