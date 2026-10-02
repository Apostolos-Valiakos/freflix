<template>
  <div class="page-gutter pt-24">
    <h1 class="text-4xl font-bold tracking-tight lg:text-5xl">{{ title }}</h1>
    <MediaGrid class="mt-8" :items="items" :type="type" :loading="loading" />
    <div ref="sentinel" class="h-10"></div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();

const type = computed<MediaType>(() => (route.params.type === "tv" ? "tv" : "movie"));
const slug = computed(() => String(route.params.slug));
const genreId = computed(() =>
  slug.value.startsWith("genre-") ? Number(slug.value.slice(6)) : null
);
const genreName = ref("");

const noun = computed(() => (type.value === "movie" ? "Movies" : "Series"));
const title = computed(() => {
  if (slug.value === "trending") return `Trending ${noun.value}`;
  if (slug.value === "top-rated") return `Top Rated ${noun.value}`;
  if (genreId.value) return genreName.value ? `${genreName.value} ${noun.value}` : noun.value;
  return `Popular ${noun.value}`;
});

function request(page: number) {
  const common = { language: "en-US", include_adult: false, page };
  if (slug.value === "trending") {
    return tmdbFetch(`/trending/${type.value}/day`, common);
  }
  if (slug.value === "top-rated") {
    return tmdbFetch(`/${type.value}/top_rated`, common);
  }
  return tmdbFetch(`/discover/${type.value}`, {
    ...common,
    sort_by: "popularity.desc",
    with_genres: genreId.value,
  });
}

const { items, loading, sentinel, reset } = useInfiniteList(async (page) => {
  const json = await request(page);
  return {
    ...json,
    results: tagItems(json.results, type.value).filter((item) => item.poster_path),
  };
});

useHead({ title });

onMounted(async () => {
  resetAmbient();
  reset();
  if (genreId.value) {
    const json = await tmdbFetch(`/genre/${type.value}/list`, {
      language: "en-US",
    }).catch(() => null);
    genreName.value =
      json?.genres?.find((genre: any) => genre.id === genreId.value)?.name || "";
  }
});
</script>
