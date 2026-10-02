export type MediaType = "movie" | "tv";

const IMAGE_BASE = "https://image.tmdb.org/t/p/";

export function img(path?: string | null, size = "w500") {
  return path ? `${IMAGE_BASE}${size}${path}` : "";
}

// Items saved by the old app carry `isSerie`; TMDB multi results carry `media_type`
export function mediaTypeOf(item: any, fallback?: MediaType): MediaType {
  if (item?.media_type === "movie" || item?.media_type === "tv") {
    return item.media_type;
  }
  if (item?.isSerie === "movie" || item?.isSerie === "tv") return item.isSerie;
  if (fallback) return fallback;
  return item?.first_air_date || (item?.name && !item?.title) ? "tv" : "movie";
}

export function titleOf(item: any): string {
  return item?.title || item?.name || "";
}

export function yearOf(item: any): string {
  const date = item?.release_date || item?.first_air_date || "";
  return date ? date.substring(0, 4) : "";
}

export function linkOf(item: any, fallback?: MediaType): string {
  if (item?.media_type === "person") return `/person/${item.id}`;
  return `/${mediaTypeOf(item, fallback)}/${item.id}`;
}

export function tagItems(results: any[] | undefined, type: MediaType) {
  return (results || []).map((item) => ({ ...item, isSerie: type }));
}

// Prefer the English title logo, then whatever exists
export function pickLogo(images: any): string | null {
  const logos = images?.logos;
  if (!logos?.length) return null;
  return (logos.find((logo: any) => logo.iso_639_1 === "en") || logos[0]).file_path;
}

// A poster without lettering, so it can sit behind the title on phones
export function pickTextlessPoster(images: any): string | null {
  const poster = images?.posters?.find((item: any) => !item.iso_639_1);
  return poster ? poster.file_path : null;
}

export function formatRuntime(minutes?: number | null): string {
  if (!minutes) return "";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h ? `${h}h ${m}m` : `${m}m`;
}

export function formatDate(date?: string | null): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatMoney(amount?: number | null): string {
  if (!amount) return "";
  return "$" + amount.toLocaleString("en-US");
}
