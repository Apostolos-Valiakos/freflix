const API = "https://api.themoviedb.org/3";
const CACHE_TTL = 5 * 60 * 1000;

let token = "";
const cache = new Map<string, { at: number; promise: Promise<any> }>();

export function initTmdb(bearerToken: string) {
  token = bearerToken;
}

type Params = Record<string, string | number | boolean | null | undefined>;

function buildUrl(path: string, params: Params) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  }
  const qs = query.toString();
  return `${API}${path}${qs ? "?" + qs : ""}`;
}

function send(url: string, options: RequestInit = {}) {
  return fetch(url, {
    ...options,
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.body ? { "Content-Type": "application/json" } : {}),
    },
  });
}

async function request(url: string, options: RequestInit = {}) {
  const res = await send(url, options);
  return res.json();
}

async function get(url: string) {
  let res = await send(url);
  // TMDB rate limit: back off once before giving up
  if (res.status === 429) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    res = await send(url);
  }
  if (!res.ok) throw new Error(`TMDB ${res.status} for ${url}`);
  return res.json();
}

// Cached GET for catalogue data. Failed requests are not cached.
export function tmdbFetch<T = any>(path: string, params: Params = {}): Promise<T> {
  const url = buildUrl(path, params);
  const hit = cache.get(url);
  if (hit && Date.now() - hit.at < CACHE_TTL) return hit.promise;

  const promise = get(url).catch((err) => {
    cache.delete(url);
    throw err;
  });
  cache.set(url, { at: Date.now(), promise });
  return promise;
}

// Uncached request for account data and writes
export function tmdbRequest<T = any>(
  path: string,
  params: Params = {},
  options: { method?: string; body?: unknown } = {}
): Promise<T> {
  return request(buildUrl(path, params), {
    method: options.method || "GET",
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
}
