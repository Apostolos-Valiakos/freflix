<template>
  <div>
    <HeroSlider :type="type" />

    <div class="relative z-10 mt-2 lg:-mt-10">
      <div class="page-gutter">
        <h1 class="text-5xl font-bold tracking-tight lg:text-6xl">
          {{ type === "movie" ? "Movies" : "TV Series" }}
        </h1>
        <FilterBar
          class="relative z-30 mt-6"
          :type="type"
          :model-value="filters"
          @update:model-value="applyFilters"
          @random="playRandom"
          @clear="applyFilters(defaultFilters())"
        />
      </div>

      <MediaRow
        v-if="upcoming.length"
        :title="type === 'movie' ? 'Upcoming' : 'New Episodes Airing'"
      >
        <BackdropCard
          v-for="item in upcoming"
          :key="item.id"
          :item="item"
          :type="type"
          :badge="type === 'movie' ? 'Coming Soon' : ''"
          class="w-[280px] lg:w-[316px]"
        />
      </MediaRow>

      <div class="page-gutter mt-6">
        <MediaGrid :items="items" :type="type" :loading="loading" />
        <p
          v-if="!loading && !items.length"
          class="py-20 text-center text-white/50"
        >
          Nothing matches these filters.
        </p>
        <div ref="sentinel" class="h-10"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BrowseFilters } from "./FilterBar.vue";

const props = defineProps<{ type: MediaType }>();

const route = useRoute();
const router = useRouter();

function defaultFilters(): BrowseFilters {
  return { genre: null, year: null, sort: "popular", provider: null, country: null };
}

function isoDate(offsetDays = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().substring(0, 10);
}

// Filters are kept in the URL so they survive back/forward and refresh
const filters = computed<BrowseFilters>(() => {
  const q = route.query;
  return {
    genre: q.genre ? Number(q.genre) : null,
    year: q.year ? Number(q.year) : null,
    sort: typeof q.sort === "string" ? q.sort : "popular",
    provider: q.provider ? Number(q.provider) : null,
    country: typeof q.country === "string" ? q.country : null,
  };
});

function applyFilters(next: BrowseFilters) {
  const query: Record<string, string> = {};
  if (next.genre != null) query.genre = String(next.genre);
  if (next.year != null) query.year = String(next.year);
  if (next.sort !== "popular") query.sort = next.sort;
  if (next.provider != null) query.provider = String(next.provider);
  if (next.country) query.country = next.country;
  router.replace({ query });
}

function discoverParams(page: number) {
  const f = filters.value;
  const isMovie = props.type === "movie";
  const dateField = isMovie ? "primary_release_date" : "first_air_date";
  const params: Record<string, any> = {
    language: "en-US",
    include_adult: false,
    page,
    sort_by: "popularity.desc",
    with_genres: f.genre,
    with_origin_country: f.country,
    [isMovie ? "primary_release_year" : "first_air_date_year"]: f.year,
  };

  if (f.provider != null) {
    params.with_watch_providers = f.provider;
    params.watch_region = WATCH_REGION;
  }

  if (f.sort === "top_rated") {
    params.sort_by = "vote_average.desc";
    params["vote_count.gte"] = 300;
  } else if (f.sort === "upcoming") {
    params[`${dateField}.gte`] = isoDate(1);
  } else if (f.sort === "now") {
    if (isMovie) {
      params.with_release_type = "2|3";
      params["primary_release_date.gte"] = isoDate(-45);
      params["primary_release_date.lte"] = isoDate();
    } else {
      params["air_date.gte"] = isoDate();
      params["air_date.lte"] = isoDate(7);
    }
  }
  return params;
}

const { items, loading, sentinel, reset } = useInfiniteList(async (page) => {
  const json = await tmdbFetch(`/discover/${props.type}`, discoverParams(page));
  return {
    ...json,
    results: tagItems(json.results, props.type).filter((item) => item.poster_path),
  };
});

async function playRandom() {
  try {
    const first = await tmdbFetch(`/discover/${props.type}`, discoverParams(1));
    const pages = Math.min(first.total_pages || 1, 50);
    const page = 1 + Math.floor(Math.random() * pages);
    const json =
      page === 1
        ? first
        : await tmdbFetch(`/discover/${props.type}`, discoverParams(page));
    const pool = (json.results || []).filter((item: any) => item.poster_path);
    const pick = pool[Math.floor(Math.random() * pool.length)];
    if (pick) router.push(`/${props.type}/${pick.id}`);
  } catch (err) {
    console.error(err);
  }
}

const upcoming = ref<any[]>([]);

async function loadUpcoming() {
  try {
    const json =
      props.type === "movie"
        ? await tmdbFetch("/discover/movie", {
            language: "en-US",
            include_adult: false,
            sort_by: "popularity.desc",
            "primary_release_date.gte": isoDate(1),
          })
        : await tmdbFetch("/tv/on_the_air", { language: "en-US" });
    upcoming.value = tagItems(json.results, props.type).filter(
      (item) => item.backdrop_path
    );
  } catch (err) {
    console.error(err);
  }
}

watch(() => JSON.stringify(filters.value), reset);

onMounted(() => {
  reset();
  loadUpcoming();
});
</script>
