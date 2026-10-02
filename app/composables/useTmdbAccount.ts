const state = reactive({
  isLoggedIn: false,
  accountId: null as string | null,
  username: null as string | null,
  sessionId: null as string | null,
});

export function restoreTmdbSession() {
  const sessionId = localStorage.getItem("tmdbSessionId");
  const accountId = localStorage.getItem("tmdbAccountId");
  const username = localStorage.getItem("tmdbUsername");
  if (sessionId && accountId) {
    state.sessionId = sessionId;
    state.accountId = accountId;
    state.username = username;
    state.isLoggedIn = true;
  }
}

async function login() {
  const json = await tmdbRequest("/authentication/token/new");
  if (!json.success || !json.request_token) {
    throw new Error("Could not create TMDB request token");
  }
  localStorage.setItem("tmdbPendingRequestToken", json.request_token);
  const redirectTo = encodeURIComponent(
    `${window.location.origin}/auth-callback`
  );
  window.location.assign(
    `https://www.themoviedb.org/authenticate/${json.request_token}?redirect_to=${redirectTo}`
  );
}

async function handleAuthCallback(query: Record<string, any>) {
  const pendingToken = localStorage.getItem("tmdbPendingRequestToken");
  localStorage.removeItem("tmdbPendingRequestToken");

  if (query.approved !== "true" || !query.request_token) {
    return { success: false, reason: "denied" };
  }
  if (pendingToken && query.request_token !== pendingToken) {
    return { success: false, reason: "token_mismatch" };
  }

  try {
    const sessionJson = await tmdbRequest(
      "/authentication/session/new",
      {},
      { method: "POST", body: { request_token: query.request_token } }
    );
    if (!sessionJson.success || !sessionJson.session_id) {
      return { success: false, reason: "session_failed" };
    }

    const account = await tmdbRequest("/account", {
      session_id: sessionJson.session_id,
    });
    if (!account.id) {
      return { success: false, reason: "account_failed" };
    }

    localStorage.setItem("tmdbSessionId", sessionJson.session_id);
    localStorage.setItem("tmdbAccountId", account.id);
    localStorage.setItem("tmdbUsername", account.username || "");

    state.sessionId = sessionJson.session_id;
    state.accountId = String(account.id);
    state.username = account.username || "";
    state.isLoggedIn = true;

    migrateLocalWatchlistToTmdb()
      .then(() => syncWatchlist())
      .catch((err) => console.error("Watchlist migration failed:", err));

    return { success: true };
  } catch (err) {
    console.error(err);
    return { success: false, reason: "error" };
  }
}

function logout() {
  const sessionId = state.sessionId;
  if (sessionId) {
    tmdbRequest(
      "/authentication/session",
      {},
      { method: "DELETE", body: { session_id: sessionId } }
    ).catch((err) => console.error(err));
  }
  localStorage.removeItem("tmdbSessionId");
  localStorage.removeItem("tmdbAccountId");
  localStorage.removeItem("tmdbUsername");
  state.sessionId = null;
  state.accountId = null;
  state.username = null;
  state.isLoggedIn = false;
}

function getAccountStates(mediaType: MediaType, id: number) {
  if (!state.isLoggedIn) return Promise.resolve(null);
  return tmdbRequest(`/${mediaType}/${id}/account_states`, {
    session_id: state.sessionId,
  });
}

function toggleFavorite(mediaType: MediaType, id: number, value: boolean) {
  return tmdbRequest(
    `/account/${state.accountId}/favorite`,
    { session_id: state.sessionId },
    {
      method: "POST",
      body: { media_type: mediaType, media_id: id, favorite: value },
    }
  );
}

function setWatchlist(mediaType: MediaType, id: number, value: boolean) {
  return tmdbRequest(
    `/account/${state.accountId}/watchlist`,
    { session_id: state.sessionId },
    {
      method: "POST",
      body: { media_type: mediaType, media_id: id, watchlist: value },
    }
  );
}

async function fetchAccountList(kind: string, mediaType: "movies" | "tv") {
  const results: any[] = [];
  let page = 1;
  let totalPages = 1;
  do {
    const json = await tmdbRequest(
      `/account/${state.accountId}/${kind}/${mediaType}`,
      { session_id: state.sessionId, page }
    );
    results.push(...(json.results || []));
    totalPages = json.total_pages || 1;
    page += 1;
  } while (page <= totalPages);
  return results;
}

async function fetchAccountWatchlist() {
  const [movies, tv] = await Promise.all([
    fetchAccountList("watchlist", "movies"),
    fetchAccountList("watchlist", "tv"),
  ]);
  return [...tagItems(movies, "movie"), ...tagItems(tv, "tv")];
}

async function getFavorites() {
  if (!state.isLoggedIn) return [];
  const [movies, tv] = await Promise.all([
    fetchAccountList("favorite", "movies"),
    fetchAccountList("favorite", "tv"),
  ]);
  return [...tagItems(movies, "movie"), ...tagItems(tv, "tv")];
}

async function getPersonalizedRecommendations() {
  if (!state.isLoggedIn) return [];
  const favorites = await getFavorites();
  if (!favorites.length) return [];

  const favoriteIds = new Set(favorites.map((item) => item.id));
  const sample = favorites.slice(0, 10);

  const perFavorite = await Promise.all(
    sample.map((item) => {
      const mediaType = mediaTypeOf(item);
      return tmdbFetch(`/${mediaType}/${item.id}/recommendations`, {
        language: "en-US",
        page: 1,
      })
        .then((json) => tagItems(json.results, mediaType))
        .catch((err) => {
          console.error(err);
          return [];
        });
    })
  );

  const seen = new Set();
  const merged = [];
  for (const list of perFavorite) {
    for (const rec of list) {
      if (favoriteIds.has(rec.id) || seen.has(rec.id)) continue;
      seen.add(rec.id);
      merged.push(rec);
    }
  }
  return merged.slice(0, 18);
}

async function migrateLocalWatchlistToTmdb() {
  const localWatchlist = JSON.parse(localStorage.getItem("watchlist") || "[]");
  if (!localWatchlist.length) return;

  const remote = await fetchAccountWatchlist();
  const existing = new Set(remote.map((item) => `${item.isSerie}:${item.id}`));

  for (const item of localWatchlist) {
    const mediaType = mediaTypeOf(item);
    if (!existing.has(`${mediaType}:${item.id}`)) {
      await setWatchlist(mediaType, item.id, true).catch((err) =>
        console.error(err)
      );
    }
  }
}

export function useTmdbAccount() {
  return {
    state,
    login,
    handleAuthCallback,
    logout,
    getAccountStates,
    toggleFavorite,
    setWatchlist,
    fetchAccountWatchlist,
    getFavorites,
    getPersonalizedRecommendations,
  };
}
