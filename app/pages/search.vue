<template>
  <div class="page-gutter pt-28">
    <h1 class="text-center text-3xl font-bold tracking-tight lg:text-4xl">
      Ready for an adventure?
    </h1>

    <label
      class="glass-soft mx-auto mt-6 flex h-12 max-w-xl items-center gap-3 rounded-full px-5 focus-within:border-white/30"
    >
      <Search class="h-5 w-5 flex-none text-white/50" />
      <input
        ref="input"
        v-model="term"
        type="search"
        placeholder="Search movies, TV shows & people..."
        class="h-full w-full bg-transparent font-medium text-white outline-none placeholder:text-white/40"
        @input="onInput"
        @keydown.enter="commit"
      />
    </label>

    <div
      v-if="keywords.length"
      class="no-scrollbar mx-auto mt-4 flex max-w-4xl gap-2 overflow-x-auto lg:flex-wrap lg:justify-center"
    >
      <button
        v-for="keyword in keywords"
        :key="keyword.id"
        class="flex-none rounded-full border px-4 py-1.5 text-sm font-medium transition"
        :class="
          keyword.id === keywordId
            ? 'border-accent bg-accent text-white'
            : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
        "
        @click="toggleKeyword(keyword.id)"
      >
        {{ keyword.name }}
      </button>
    </div>

    <h2 v-if="!query" class="mt-10 text-xl font-semibold text-white/90">
      Popular right now
    </h2>

    <MediaGrid class="mt-6" :items="items" :loading="loading" />
    <p v-if="!loading && !items.length" class="py-20 text-center text-white/50">
      No results for "{{ query }}".
    </p>
    <div ref="sentinel" class="h-10"></div>
  </div>
</template>

<script setup lang="ts">
import { Search } from "lucide-vue-next";

const route = useRoute();
const router = useRouter();

const input = ref<HTMLInputElement | null>(null);
const term = ref(typeof route.query.q === "string" ? route.query.q : "");
const query = ref(term.value.trim());
const keywords = ref<any[]>([]);
const keywordId = ref<number | null>(null);

let debounce: ReturnType<typeof setTimeout> | null = null;

async function searchByKeyword(page: number) {
  const params = {
    language: "en-US",
    include_adult: false,
    sort_by: "popularity.desc",
    with_keywords: keywordId.value,
    page,
  };
  const [movies, tv] = await Promise.all([
    tmdbFetch("/discover/movie", params),
    tmdbFetch("/discover/tv", params),
  ]);
  const results = [...tagItems(movies.results, "movie"), ...tagItems(tv.results, "tv")]
    .filter((item) => item.poster_path)
    .sort((a, b) => b.popularity - a.popularity);
  return {
    results,
    total_pages: Math.max(movies.total_pages || 0, tv.total_pages || 0),
  };
}

const { items, loading, sentinel, reset } = useInfiniteList(async (page) => {
  if (keywordId.value) return searchByKeyword(page);

  const json = query.value
    ? await tmdbFetch("/search/multi", {
        language: "en-US",
        include_adult: false,
        query: query.value,
        page,
      })
    : await tmdbFetch("/trending/all/day", { language: "en-US", page });

  return {
    ...json,
    results: (json.results || []).filter((item: any) =>
      item.media_type === "person" ? item.profile_path : item.poster_path
    ),
  };
}, 50);

async function loadKeywords() {
  keywords.value = [];
  if (!query.value) return;
  try {
    const json = await tmdbFetch("/search/keyword", { query: query.value, page: 1 });
    keywords.value = (json.results || []).slice(0, 12);
  } catch (err) {
    console.error(err);
  }
}

function commit() {
  if (debounce) clearTimeout(debounce);
  const next = term.value.trim();
  if (next === query.value) return;
  query.value = next;
  keywordId.value = null;
  router.replace({ query: next ? { q: next } : {} });
  reset();
  loadKeywords();
}

function onInput() {
  if (debounce) clearTimeout(debounce);
  debounce = setTimeout(commit, 350);
}

function toggleKeyword(id: number) {
  keywordId.value = keywordId.value === id ? null : id;
  reset();
}

useHead({ title: "Search" });

onMounted(() => {
  resetAmbient();
  reset();
  loadKeywords();
  input.value?.focus();
});

onBeforeUnmount(() => {
  if (debounce) clearTimeout(debounce);
});
</script>
