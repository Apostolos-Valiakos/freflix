<template>
  <div v-if="person" class="page-gutter mx-auto max-w-[1400px] pt-28">
    <div class="flex flex-col items-center gap-8 md:flex-row md:items-start md:gap-12">
      <div
        class="aspect-square w-48 flex-none overflow-hidden rounded-full border border-white/10 bg-white/5 shadow-2xl md:w-72"
      >
        <img
          v-if="person.profile_path"
          :src="img(person.profile_path, 'h632')"
          :alt="person.name"
          class="h-full w-full object-cover"
        />
      </div>

      <div class="min-w-0 text-center md:text-left">
        <h1 class="text-4xl font-bold tracking-tight lg:text-6xl">
          {{ person.name }}
        </h1>
        <div class="mt-4 flex flex-wrap justify-center gap-2 md:justify-start">
          <span v-for="chip in chips" :key="chip" class="chip">{{ chip }}</span>
        </div>
        <p
          v-if="person.biography"
          class="mt-6 max-w-3xl whitespace-pre-line leading-relaxed text-white/80"
          :class="{ 'line-clamp-6': !expanded }"
        >
          {{ person.biography }}
        </p>
        <button
          v-if="person.biography?.length > 500"
          class="mt-2 text-sm font-medium text-white/60 hover:text-white"
          @click="expanded = !expanded"
        >
          {{ expanded ? "Show Less" : "Read More" }}
        </button>
      </div>
    </div>

    <div class="mt-14 flex items-center justify-between gap-4">
      <h2 class="text-2xl font-semibold">Filmography</h2>
      <SegmentedControl
        v-if="crew.length"
        v-model="tab"
        :options="[
          { value: 'cast', label: 'Acting' },
          { value: 'crew', label: 'Crew' },
        ]"
      />
    </div>
    <MediaGrid class="mt-6" :items="tab === 'cast' ? acting : crew" />
  </div>

  <div v-else class="grid min-h-screen place-items-center">
    <p v-if="notFound" class="text-white/60">This person could not be found.</p>
    <LoaderCircle v-else class="h-10 w-10 animate-spin text-white/40" />
  </div>
</template>

<script setup lang="ts">
import { LoaderCircle } from "lucide-vue-next";

const route = useRoute();
const id = parseInt(String(route.params.id), 10);

const person = ref<any>(null);
const notFound = ref(false);
const expanded = ref(false);
const tab = ref("cast");
const acting = ref<any[]>([]);
const crew = ref<any[]>([]);

const chips = computed(() => {
  const p = person.value;
  const list: string[] = [];
  if (p.birthday) {
    list.push(`Born ${formatDate(p.birthday)}`);
    const end = p.deathday ? new Date(p.deathday) : new Date();
    const age = Math.floor(
      (end.getTime() - new Date(p.birthday).getTime()) / (365.25 * 24 * 3600 * 1000)
    );
    list.push(p.deathday ? `Died ${formatDate(p.deathday)} (${age})` : `${age} years old`);
  }
  if (p.place_of_birth) list.push(p.place_of_birth);
  return list;
});

// One entry per title, most popular first
function uniqueCredits(credits: any[]) {
  const seen = new Set<string>();
  return (credits || [])
    .filter((credit) => credit.poster_path)
    .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
    .filter((credit) => {
      const key = `${credit.media_type}:${credit.id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

useHead({ title: () => person.value?.name || "Freflix" });

onMounted(async () => {
  resetAmbient();
  try {
    const [details, credits] = await Promise.all([
      tmdbFetch(`/person/${id}`, { language: "en-US" }),
      tmdbFetch(`/person/${id}/combined_credits`, { language: "en-US" }),
    ]);
    if (!details?.id) {
      notFound.value = true;
      return;
    }
    person.value = details;
    acting.value = uniqueCredits(credits.cast);
    crew.value = uniqueCredits(credits.crew);
    if (!acting.value.length && crew.value.length) tab.value = "crew";
  } catch (err) {
    console.error(err);
    notFound.value = true;
  }
});
</script>

<style scoped>
@reference "~/assets/css/main.css";

.chip {
  @apply rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white/90;
}
</style>
