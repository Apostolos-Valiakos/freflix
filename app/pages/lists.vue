<template>
  <div class="page-gutter mx-auto max-w-[1400px] pt-28">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <h1 class="flex items-center gap-4 text-4xl font-bold tracking-tight">
        <ListVideo class="h-8 w-8" /> My Lists
      </h1>
      <SegmentedControl :options="tabs" :model-value="tab" @update:model-value="setTab" />
    </div>

    <div
      v-if="tab === 'liked' && !account.state.isLoggedIn"
      class="empty-panel"
    >
      <Heart class="h-10 w-10 text-white/40" />
      <h2 class="text-lg font-semibold">Log in to see your liked titles</h2>
      <p class="max-w-sm text-sm text-white/60">
        Likes are saved to your TMDB account so they follow you across devices.
      </p>
      <button
        class="mt-2 h-11 rounded-full bg-white px-6 font-semibold text-black"
        @click="account.login()"
      >
        Login
      </button>
    </div>

    <div v-else-if="likedLoading" class="mt-8">
      <MediaGrid loading />
    </div>

    <div v-else-if="!items.length" class="empty-panel">
      <component :is="emptyState.icon" class="h-10 w-10 text-white/40" />
      <h2 class="text-lg font-semibold">{{ emptyState.title }}</h2>
      <p class="max-w-sm text-sm text-white/60">{{ emptyState.text }}</p>
    </div>

    <MediaGrid v-else class="mt-8">
      <MediaCard
        v-for="item in items"
        :key="mediaTypeOf(item) + item.id"
        :item="item"
        show-title
      >
        <button
          class="absolute right-2 top-2 z-10 grid h-8 w-8 place-items-center rounded-full bg-black/70 text-white/80 backdrop-blur-sm transition hover:bg-accent hover:text-white"
          :aria-label="`Remove ${titleOf(item)}`"
          title="Remove"
          @click.prevent.stop="remove(item)"
        >
          <X class="h-4 w-4" />
        </button>
      </MediaCard>
    </MediaGrid>
  </div>
</template>

<script setup lang="ts">
import { Bookmark, Heart, History, ListVideo, X } from "lucide-vue-next";

const route = useRoute();
const router = useRouter();
const library = useLibrary();
const account = useTmdbAccount();

const tabs = [
  { value: "watchlist", label: "Watchlist" },
  { value: "liked", label: "Liked" },
  { value: "history", label: "History" },
];

const tab = computed(() =>
  route.query.tab === "liked" || route.query.tab === "history"
    ? route.query.tab
    : "watchlist"
);

const liked = ref<any[]>([]);
const likedLoading = ref(false);

const items = computed(() => {
  if (tab.value === "liked") return liked.value;
  if (tab.value === "history") return library.recentHistory.value;
  return library.watchlist.value;
});

const emptyState = computed(() => {
  if (tab.value === "liked") {
    return {
      icon: Heart,
      title: "Nothing liked yet",
      text: "Tap the heart on a movie or show to keep it here.",
    };
  }
  if (tab.value === "history") {
    return {
      icon: History,
      title: "No watch history",
      text: "Titles you open will show up here.",
    };
  }
  return {
    icon: Bookmark,
    title: "Your watchlist is empty",
    text: "Use the + button on a movie or show to save it for later.",
  };
});

function setTab(value: string) {
  router.replace({ query: value === "watchlist" ? {} : { tab: value } });
}

async function loadLiked() {
  if (!account.state.isLoggedIn) return;
  likedLoading.value = true;
  try {
    liked.value = await account.getFavorites();
  } catch (err) {
    console.error(err);
  } finally {
    likedLoading.value = false;
  }
}

function remove(item: any) {
  const type = mediaTypeOf(item);
  if (tab.value === "watchlist") {
    library.toggleWatchlist(item, type);
  } else if (tab.value === "history") {
    library.removeFromHistory(item.id, type);
  } else {
    liked.value = liked.value.filter((entry) => entry !== item);
    account.toggleFavorite(type, item.id, false).catch((err) => console.error(err));
  }
}

watch(
  tab,
  (value) => {
    if (value === "liked") loadLiked();
  },
  { immediate: true }
);

useHead({ title: "My Lists" });

onMounted(resetAmbient);
</script>

<style scoped>
@reference "~/assets/css/main.css";

.empty-panel {
  @apply mt-8 flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-6 py-20 text-center backdrop-blur-md;
}
</style>
