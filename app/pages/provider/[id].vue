<template>
  <div class="page-gutter pt-24">
    <div class="flex items-center gap-4">
      <img
        v-if="provider?.logo_path"
        :src="img(provider.logo_path, 'w154')"
        :alt="provider.provider_name"
        class="h-16 w-16 rounded-2xl border border-white/10 shadow-lg"
      />
      <h1 class="text-4xl font-bold tracking-tight lg:text-5xl">
        {{ provider?.provider_name || "Provider" }}
      </h1>
    </div>

    <SegmentedControl
      class="mt-6"
      :options="typeOptions"
      :model-value="type"
      @update:model-value="setType"
    />

    <MediaGrid class="mt-8" :items="items" :type="type" :loading="loading" />
    <p v-if="!loading && !items.length" class="py-20 text-center text-white/50">
      Nothing available here right now.
    </p>
    <div ref="sentinel" class="h-10"></div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const router = useRouter();

const providerId = computed(() => Number(route.params.id));
const type = computed<MediaType>(() => (route.query.type === "tv" ? "tv" : "movie"));
const provider = ref<any>(null);

const typeOptions = [
  { value: "movie", label: "Movies" },
  { value: "tv", label: "Series" },
];

function setType(value: string) {
  router.replace({ query: value === "tv" ? { type: "tv" } : {} });
}

const { items, loading, sentinel, reset } = useInfiniteList(async (page) => {
  const json = await tmdbFetch(`/discover/${type.value}`, {
    language: "en-US",
    include_adult: false,
    sort_by: "popularity.desc",
    with_watch_providers: providerId.value,
    watch_region: WATCH_REGION,
    page,
  });
  return {
    ...json,
    results: tagItems(json.results, type.value).filter((item) => item.poster_path),
  };
});

useHead({ title: () => provider.value?.provider_name || "Provider" });

watch([providerId, type], reset);

onMounted(async () => {
  resetAmbient();
  reset();
  provider.value = await findProvider(providerId.value).catch(() => null);
});
</script>
