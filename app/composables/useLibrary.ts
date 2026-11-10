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

function keyOf(item: any, type: MediaType = mediaTypeOf(item)) {
  return `${type}:${item.id}`;
}

// Which watchlist items this device knows are in the TMDB account, per account.
// An item that was synced but has left the account was removed on another device;
// an item never synced was added here and still has to be uploaded.
const SYNCED_KEY = "watchlistSynced";

function readSynced(accountId: string | null): Set<string> {
  try {
    const saved = JSON.parse(localStorage.getItem(SYNCED_KEY) || "null");
    if (saved && saved.accountId === accountId && Array.isArray(saved.keys)) {
      return new Set(saved.keys);
    }
  } catch {}
  return new Set();
}

function persistSynced(accountId: string | null, keys: Set<string>) {
  localStorage.setItem(
    SYNCED_KEY,
    JSON.stringify({ accountId, keys: [...keys] }),
  );
}

export function loadLibrary() {
  watchlist.value = read("watchlist");
  history.value = read("history");
  syncWatchlist().catch((err) => console.error(err));
}

let syncing: Promise<void> | null = null;

// Merges this device's watchlist with the TMDB account's: uploads items the
// account lacks, adds the account's items locally, and drops items removed on
// another device. A local item is only dropped once it is known to have been in
// the account, so nothing is lost when an upload fails; it is retried next time.
export function syncWatchlist(): Promise<void> {
  const account = useTmdbAccount();
  if (!account.state.isLoggedIn) return Promise.resolve();
  if (!syncing) {
    syncing = mergeWithAccount(account).finally(() => (syncing = null));
  }
  return syncing;
}

async function mergeWithAccount(account: ReturnType<typeof useTmdbAccount>) {
  const accountId = account.state.accountId;
  const snapshot = [...watchlist.value];
  const before = new Set(snapshot.map((item) => keyOf(item)));
  const remote = await account.fetchAccountWatchlist();
  const remoteKeys = new Set(remote.map((item) => keyOf(item)));
  const synced = readSynced(accountId);

  const kept: any[] = [];
  for (const item of snapshot) {
    const key = keyOf(item);
    if (remoteKeys.has(key)) {
      kept.push(item);
    } else if (synced.has(key)) {
      synced.delete(key); // removed from the account on another device
    } else {
      const type = mediaTypeOf(item);
      const res = await account
        .setWatchlist(type, item.id, true)
        .catch(() => null);
      if (res?.success) synced.add(key);
      kept.push(item);
    }
  }

  const local = new Set(kept.map((item) => keyOf(item)));
  const fromAccount = remote.filter((item) => !local.has(keyOf(item)));
  for (const key of remoteKeys) synced.add(key);

  // Toggles made while the sync ran (adds or removals) are kept as they are.
  const now = new Set(watchlist.value.map((item) => keyOf(item)));
  const addedMeanwhile = watchlist.value.filter(
    (item) => !before.has(keyOf(item)),
  );
  const merged = [...addedMeanwhile, ...kept, ...fromAccount];
  watchlist.value = merged
    .filter((item) => now.has(keyOf(item)) || !before.has(keyOf(item)))
    .filter(
      (item, i, list) =>
        list.findIndex((other) => keyOf(other) === keyOf(item)) === i,
    )
    .map((item) => compact(item, mediaTypeOf(item)));
  persist("watchlist", watchlist.value);
  persistSynced(accountId, synced);
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
      const accountId = account.state.accountId;
      const key = keyOf(item, type);
      account
        .setWatchlist(type, item.id, added)
        .then((res) => {
          // Only a confirmed change is recorded; a failed add is retried by the next sync
          if (!res?.success) return;
          const synced = readSynced(accountId);
          if (added) synced.add(key);
          else synced.delete(key);
          persistSynced(accountId, synced);
        })
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
