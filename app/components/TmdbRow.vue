<template>
  <MediaRow
    v-if="loading || items.length"
    :title="title"
    :items="items"
    :type="type"
    :view-all="viewAll"
    :loading="loading"
  />
</template>

<script setup lang="ts">
const props = defineProps<{
  title: string;
  path: string;
  params?: Record<string, any>;
  type: MediaType;
  viewAll?: string;
}>();

const items = ref<any[]>([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const json = await tmdbFetch(props.path, {
      language: "en-US",
      include_adult: false,
      ...props.params,
    });
    items.value = tagItems(json.results, props.type).filter(
      (item) => item.poster_path
    );
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
});
</script>
