// Main streaming services, in the order they are shown. TMDB's own priority
// order leads with resale channels, so the well-known ones are pinned first.
const FEATURED = [
  8, 9, 337, 350, 2, 15, 1899, 2303, 386, 283, 43, 526, 34, 188, 192, 73, 300,
];

export async function fetchProviders(type: MediaType, limit = 20) {
  const json = await tmdbFetch(`/watch/providers/${type}`, {
    language: "en-US",
    watch_region: WATCH_REGION,
  });
  const all: any[] = (json.results || []).filter(
    (provider: any) => provider.logo_path
  );
  const byId = new Map(all.map((provider) => [provider.provider_id, provider]));

  const featured = FEATURED.map((id) => byId.get(id)).filter(Boolean);
  const rest = all
    .filter((provider) => !FEATURED.includes(provider.provider_id))
    .sort((a, b) => {
      const pa = a.display_priorities?.[WATCH_REGION] ?? a.display_priority ?? 999;
      const pb = b.display_priorities?.[WATCH_REGION] ?? b.display_priority ?? 999;
      return pa - pb;
    });

  return [...featured, ...rest].slice(0, limit);
}

export async function findProvider(id: number) {
  for (const type of ["movie", "tv"] as const) {
    const json = await tmdbFetch(`/watch/providers/${type}`, {
      language: "en-US",
      watch_region: WATCH_REGION,
    });
    const match = (json.results || []).find(
      (provider: any) => provider.provider_id === id
    );
    if (match) return match;
  }
  return null;
}
