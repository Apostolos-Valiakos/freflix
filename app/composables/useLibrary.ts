// Watchlist and history live in localStorage under the same keys and item
// shape (`isSerie`) the previous app used, so existing data keeps working.
const watchlist = ref<any[]>([]);
const history = ref<any[]>([]);

function read(key: string): any[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persist(key: string, list: any[]) {
  localStorage.setItem(key, JSON.stringify(list));
}

function compact(item: any, type: MediaType) {
  return {
    id: item.id,
    isSerie: type,
    title: item.title,
    name: item.name,
    overview: item.overview,
    poster_path: item.poster_path,
    backdrop_path: item.backdrop_path,
    vote_average: item.vote_average,
    release_date: item.release_date,
    first_air_date: item.first_air_date,
  };
}

function same(item: any, id: number, type: MediaType) {
  return item.id === id && mediaTypeOf(item) === type;
}

export function loadLibrary() {
  watchlist.value = read("watchlist");
  history.value = read("history");
  syncWatchlist().catch((err) => console.error(err));
}

// When logged in, the TMDB account watchlist is the source of truth
export async function syncWatchlist() {
  const account = useTmdbAccount();
  if (!account.state.isLoggedIn) return;
  watchlist.value = await account.fetchAccountWatchlist();
  persist("watchlist", watchlist.value);
}

export function useLibrary() {
  const account = useTmdbAccount();

  function inWatchlist(id: number, type: MediaType) {
    return watchlist.value.some((item) => same(item, id, type));
  }

  function toggleWatchlist(item: any, type: MediaType) {
    const added = !inWatchlist(item.id, type);
    watchlist.value = added
      ? [compact(item, type), ...watchlist.value]
      : watchlist.value.filter((entry) => !same(entry, item.id, type));
    persist("watchlist", watchlist.value);

    if (account.state.isLoggedIn) {
      account
        .setWatchlist(type, item.id, added)
        .catch((err) => console.error(err));
    }
    return added;
  }

  // Newest entry is kept last, as before
  function addToHistory(item: any, type: MediaType) {
    history.value = [
      ...history.value.filter((entry) => !same(entry, item.id, type)),
      compact(item, type),
    ];
    persist("history", history.value);
  }

  function removeFromHistory(id: number, type: MediaType) {
    history.value = history.value.filter((entry) => !same(entry, id, type));
    persist("history", history.value);
  }

  const recentHistory = computed(() => [...history.value].reverse());

  return {
    watchlist,
    history,
    recentHistory,
    inWatchlist,
    toggleWatchlist,
    addToHistory,
    removeFromHistory,
  };
}
