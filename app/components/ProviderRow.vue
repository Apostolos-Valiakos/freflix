<template>
  <MediaRow
    v-if="providers.length"
    :items="items"
    :type="type"
    :loading="loading"
    :view-all="providerId ? `/provider/${providerId}?type=${type}` : ''"
  >
    <template #title>
      <span>{{ type === "movie" ? "Movies on" : "TV Series on" }}</span>
      <FilterDropdown
        v-model="providerId"
        variant="inline"
        label="Provider"
        :options="options"
      />
    </template>
  </MediaRow>
</template>

<script setup lang="ts">
const props = defineProps<{ type: MediaType }>();

const providers = ref<any[]>([]);
const providerId = ref<number | null>(null);
const items = ref<any[]>([]);
const loading = ref(true);

const options = computed(() =>
  providers.value.map((provider) => ({
    value: provider.provider_id,
    label: provider.provider_name,
    logo: img(provider.logo_path, "w92"),
  }))
);

async function load() {
  if (!providerId.value) return;
  loading.value = true;
  try {
    const json = await tmdbFetch(`/discover/${props.type}`, {
      language: "en-US",
      include_adult: false,
      sort_by: "popularity.desc",
      with_watch_providers: providerId.value,
      watch_region: WATCH_REGION,
    });
    items.value = tagItems(json.results, props.type).filter(
      (item) => item.poster_path
    );
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
}

watch(providerId, load);

onMounted(async () => {
  try {
    providers.value = await fetchProviders(props.type, 12);
    providerId.value = providers.value[0]?.provider_id ?? null;
  } catch (err) {
    console.error(err);
  }
});
</script>
