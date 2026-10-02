import Vue from "vue";

const API = "https://api.themoviedb.org/3";
const BEARER_TOKEN =
  "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwYjE5NTM3NWNkODk0ZGRlNzkwOGNiNzIxMmQwMTBmOCIsInN1YiI6IjY1ODdmNjU1MmRmZmQ4NWNkYjQ0ZDkwNiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.XaBBhvFBh29o9x62S5G3BJ-KVofB-_clblrCU7PUj7M";

const state = Vue.observable({
  isLoggedIn: false,
  accountId: null,
  username: null,
  sessionId: null,
});

function restoreFromStorage() {
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

async function authedFetch(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${BEARER_TOKEN}`,
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });
  return res.json();
}

async function login() {
  const json = await authedFetch("/authentication/token/new");
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

async function handleAuthCallback(query) {
  const pendingToken = localStorage.getItem("tmdbPendingRequestToken");
  localStorage.removeItem("tmdbPendingRequestToken");

  if (query.approved !== "true" || !query.request_token) {
    return { success: false, reason: "denied" };
  }
  if (pendingToken && query.request_token !== pendingToken) {
    return { success: false, reason: "token_mismatch" };
  }

  try {
    const sessionJson = await authedFetch("/authentication/session/new", {
      method: "POST",
      body: JSON.stringify({ request_token: query.request_token }),
    });
    if (!sessionJson.success || !sessionJson.session_id) {
      return { success: false, reason: "session_failed" };
    }

    const account = await authedFetch(
      `/account?session_id=${sessionJson.session_id}`
    );
    if (!account.id) {
      return { success: false, reason: "account_failed" };
    }

    localStorage.setItem("tmdbSessionId", sessionJson.session_id);
    localStorage.setItem("tmdbAccountId", account.id);
    localStorage.setItem("tmdbUsername", account.username || "");

    state.sessionId = sessionJson.session_id;
    state.accountId = account.id;
    state.username = account.username || "";
    state.isLoggedIn = true;

    migrateLocalWatchlistToTmdb().catch((err) =>
      console.error("Watchlist migration failed:", err)
    );

    return { success: true };
  } catch (err) {
    console.error(err);
    return { success: false, reason: "error" };
  }
}

function logout() {
  const sessionId = state.sessionId;
  if (sessionId) {
    authedFetch("/authentication/session", {
      method: "DELETE",
      body: JSON.stringify({ session_id: sessionId }),
    }).catch((err) => console.error(err));
  }
  localStorage.removeItem("tmdbSessionId");
  localStorage.removeItem("tmdbAccountId");
  localStorage.removeItem("tmdbUsername");
  state.sessionId = null;
  state.accountId = null;
  state.username = null;
  state.isLoggedIn = false;
}

function getAccountStates(mediaType, id) {
  if (!state.isLoggedIn) return Promise.resolve(null);
  return authedFetch(
    `/${mediaType}/${id}/account_states?session_id=${state.sessionId}`
  );
}

function toggleFavorite(mediaType, id, value) {
  return authedFetch(`/account/${state.accountId}/favorite?session_id=${state.sessionId}`, {
    method: "POST",
    body: JSON.stringify({ media_type: mediaType, media_id: id, favorite: value }),
  });
}

function setWatchlist(mediaType, id, value) {
  return authedFetch(`/account/${state.accountId}/watchlist?session_id=${state.sessionId}`, {
    method: "POST",
    body: JSON.stringify({ media_type: mediaType, media_id: id, watchlist: value }),
  });
}

function addToWatchlist(mediaType, id) {
  return setWatchlist(mediaType, id, true);
}

function removeFromWatchlist(mediaType, id) {
  return setWatchlist(mediaType, id, false);
}

async function fetchAccountList(kind, mediaType) {
  const results = [];
  let page = 1;
  let totalPages = 1;
  do {
    const json = await authedFetch(
      `/account/${state.accountId}/${kind}/${mediaType}?session_id=${state.sessionId}&page=${page}`
    );
    results.push(...(json.results || []));
    totalPages = json.total_pages || 1;
    page += 1;
  } while (page <= totalPages);
  return results;
}

function fetchAccountWatchlist(mediaType) {
  return fetchAccountList("watchlist", mediaType);
}

async function getAccountWatchlistIds(mediaType) {
  const items = await fetchAccountWatchlist(mediaType);
  return new Set(items.map((item) => item.id));
}

async function getFavorites() {
  if (!state.isLoggedIn) return [];
  const [movies, tv] = await Promise.all([
    fetchAccountList("favorite", "movies"),
    fetchAccountList("favorite", "tv"),
  ]);
  return [
    ...movies.map((item) => ({ ...item, isSerie: "movie" })),
    ...tv.map((item) => ({ ...item, isSerie: "tv" })),
  ];
}

async function getPersonalizedRecommendations() {
  if (!state.isLoggedIn) return [];
  const favorites = await getFavorites();
  if (!favorites.length) return [];

  const favoriteIds = new Set(favorites.map((item) => item.id));
  const sample = favorites.slice(0, 10);

  const perFavorite = await Promise.all(
    sample.map((item) => {
      const mediaType = item.isSerie === "tv" ? "tv" : "movie";
      return authedFetch(
        `/${mediaType}/${item.id}/recommendations?language=en-US&page=1`
      )
        .then((json) =>
          (json.results || []).map((rec) => ({ ...rec, isSerie: mediaType }))
        )
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

  const [movieIds, tvIds] = await Promise.all([
    getAccountWatchlistIds("movies"),
    getAccountWatchlistIds("tv"),
  ]);

  for (const item of localWatchlist) {
    const mediaType = item.isSerie === "tv" ? "tv" : "movie";
    const existingIds = mediaType === "tv" ? tvIds : movieIds;
    if (!existingIds.has(item.id)) {
      await addToWatchlist(mediaType, item.id).catch((err) => console.error(err));
    }
  }
}

async function syncWatchlistFromTmdb() {
  if (!state.isLoggedIn) {
    return JSON.parse(localStorage.getItem("watchlist") || "[]");
  }
  const [movies, tv] = await Promise.all([
    fetchAccountWatchlist("movies"),
    fetchAccountWatchlist("tv"),
  ]);
  const merged = [
    ...movies.map((item) => ({ ...item, isSerie: "movie" })),
    ...tv.map((item) => ({ ...item, isSerie: "tv" })),
  ];
  localStorage.setItem("watchlist", JSON.stringify(merged));
  return merged;
}

const tmdb = {
  state,
  login,
  handleAuthCallback,
  logout,
  getAccountStates,
  toggleFavorite,
  addToWatchlist,
  removeFromWatchlist,
  syncWatchlistFromTmdb,
  getFavorites,
  getPersonalizedRecommendations,
};

export default (context, inject) => {
  restoreFromStorage();
  inject("tmdb", tmdb);
};
