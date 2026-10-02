<template>
  <BaseModal :open="open" wide @close="emit('close')">
    <div class="border-b border-white/10 p-6">
      <h2 class="text-xl font-bold">Episode Ratings</h2>
      <p class="text-sm text-white/50">{{ title }}</p>
      <div class="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/60">
        <span v-for="band in BANDS" :key="band.label" class="flex items-center gap-1.5">
          <span class="h-3 w-3 rounded-sm" :class="band.swatch"></span>
          {{ band.label }}
        </span>
      </div>
    </div>

    <div class="thin-scrollbar overflow-auto p-6">
      <p v-if="loading" class="py-10 text-center text-white/50">Loading…</p>
      <table v-else class="mx-auto border-separate border-spacing-1">
        <thead>
          <tr>
            <th></th>
            <th
              v-for="season in seasons"
              :key="season"
              class="pb-1 text-xs font-semibold text-white/60"
            >
              S{{ season }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in maxEpisodes" :key="row">
            <td class="pr-2 text-right text-xs font-semibold text-white/50">
              E{{ row }}
            </td>
            <td v-for="season in seasons" :key="season">
              <div
                v-if="ratings[season]?.[row - 1] !== undefined"
                class="grid h-10 w-12 place-items-center rounded-md text-sm font-bold"
                :class="cellClass(ratings[season]![row - 1]!)"
              >
                {{ ratings[season]![row - 1] ? ratings[season]![row - 1]!.toFixed(1) : "–" }}
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
const props = defineProps<{
  open: boolean;
  tvId: number;
  title: string;
  seasons: number[];
}>();
const emit = defineEmits<{ close: [] }>();

const BANDS = [
  { min: 9, label: "9.0+", swatch: "bg-green-800", cell: "bg-green-800 text-white" },
  { min: 8, label: "8.0–8.9", swatch: "bg-green-600", cell: "bg-green-600 text-black" },
  { min: 7, label: "7.0–7.9", swatch: "bg-amber-400", cell: "bg-amber-400 text-black" },
  { min: 6, label: "6.0–6.9", swatch: "bg-orange-400", cell: "bg-orange-400 text-black" },
  { min: 0.1, label: "< 6.0", swatch: "bg-red-500", cell: "bg-red-500 text-white" },
  { min: 0, label: "Not rated", swatch: "bg-white/10", cell: "bg-white/10 text-white/40" },
];

// TMDB allows at most 20 appended sub-requests per call
const CHUNK = 20;

const ratings = ref<Record<number, number[]>>({});
const loading = ref(false);
let loadedFor = 0;

const maxEpisodes = computed(() =>
  Math.max(0, ...Object.values(ratings.value).map((list) => list.length))
);

function cellClass(rating: number) {
  return BANDS.find((band) => rating >= band.min)!.cell;
}

async function load() {
  if (loadedFor === props.tvId) return;
  loading.value = true;
  ratings.value = {};
  try {
    const result: Record<number, number[]> = {};
    for (let i = 0; i < props.seasons.length; i += CHUNK) {
      const chunk = props.seasons.slice(i, i + CHUNK);
      const json = await tmdbFetch(`/tv/${props.tvId}`, {
        language: "en-US",
        append_to_response: chunk.map((n) => `season/${n}`).join(","),
      });
      for (const season of chunk) {
        result[season] = (json[`season/${season}`]?.episodes || []).map(
          (episode: any) => episode.vote_average || 0
        );
      }
    }
    ratings.value = result;
    loadedFor = props.tvId;
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
}

watch(
  () => props.open,
  (open) => open && load()
);
</script>
