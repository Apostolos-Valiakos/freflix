<template>
  <div class="flex flex-wrap items-center justify-end gap-2 lg:gap-3">
    <button
      class="glass-soft grid h-[38px] w-[38px] place-items-center rounded-full text-white/80 transition hover:bg-white/15 hover:text-white"
      :aria-label="type === 'movie' ? 'Play Random Movie' : 'Play Random Show'"
      title="Random"
      @click="emit('random')"
    >
      <Dices class="h-4 w-4" />
    </button>
    <button
      v-if="hasFilters"
      class="glass-soft grid h-[38px] w-[38px] place-items-center rounded-full text-white/80 transition hover:bg-white/15 hover:text-white"
      aria-label="Clear filters"
      title="Clear filters"
      @click="emit('clear')"
    >
      <Trash2 class="h-4 w-4" />
    </button>

    <FilterDropdown
      :model-value="modelValue.genre"
      label="Genre"
      all-label="All Genres"
      :options="genres"
      @update:model-value="update('genre', $event)"
    />
    <FilterDropdown
      :model-value="modelValue.year"
      label="Year"
      all-label="All Years"
      :options="years"
      @update:model-value="update('year', $event)"
    />
    <FilterDropdown
      :model-value="modelValue.sort"
      label="Sort"
      :options="sortOptions"
      @update:model-value="update('sort', $event || 'popular')"
    />
    <FilterDropdown
      :model-value="modelValue.provider"
      label="Provider"
      all-label="All Providers"
      align="right"
      :options="providers"
      @update:model-value="update('provider', $event)"
    />
    <FilterDropdown
      :model-value="modelValue.country"
      label="Country"
      all-label="All Countries"
      align="right"
      :options="COUNTRIES"
      @update:model-value="update('country', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import { Dices, Trash2 } from "lucide-vue-next";

export type BrowseFilters = {
  genre: number | null;
  year: number | null;
  sort: string;
  provider: number | null;
  country: string | null;
};

const props = defineProps<{ type: MediaType; modelValue: BrowseFilters }>();
const emit = defineEmits<{
  "update:modelValue": [value: BrowseFilters];
  random: [];
  clear: [];
}>();

const genres = ref<{ value: number; label: string }[]>([]);
const providers = ref<{ value: number; label: string; logo: string }[]>([]);

const currentYear = new Date().getFullYear();
const years = Array.from({ length: currentYear - 1949 }, (_, i) => ({
  value: currentYear - i,
  label: String(currentYear - i),
}));

const sortOptions = computed(() => [
  { value: "popular", label: "Popular" },
  { value: "top_rated", label: "Top Rated" },
  props.type === "movie"
    ? { value: "now", label: "In Theaters" }
    : { value: "now", label: "On The Air" },
  { value: "upcoming", label: "Upcoming" },
]);

const hasFilters = computed(
  () =>
    props.modelValue.genre != null ||
    props.modelValue.year != null ||
    props.modelValue.provider != null ||
    props.modelValue.country != null ||
    props.modelValue.sort !== "popular"
);

function update(key: keyof BrowseFilters, value: any) {
  emit("update:modelValue", { ...props.modelValue, [key]: value });
}

onMounted(async () => {
  try {
    const [genreJson, providerList] = await Promise.all([
      tmdbFetch(`/genre/${props.type}/list`, { language: "en-US" }),
      fetchProviders(props.type, 17),
    ]);
    genres.value = (genreJson.genres || []).map((genre: any) => ({
      value: genre.id,
      label: genre.name,
    }));
    providers.value = providerList.map((provider: any) => ({
      value: provider.provider_id,
      label: provider.provider_name,
      logo: img(provider.logo_path, "w92"),
    }));
  } catch (err) {
    console.error(err);
  }
});
</script>
