<template>
  <div v-if="media">
    <WatchParty ref="party" />

    <section class="relative flex min-h-[100svh] items-end lg:min-h-[820px]">
      <div class="hero-mask absolute inset-0">
        <picture v-if="media.backdrop_path || media.poster_path">
          <source
            media="(max-width: 767px)"
            :srcset="img(mobileArt || media.backdrop_path || media.poster_path, 'w780')"
          />
          <img
            :src="img(media.backdrop_path || media.poster_path, 'original')"
            alt=""
            class="absolute inset-0 h-full w-full object-cover object-top"
          />
        </picture>
        <div
          class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30 lg:bg-gradient-to-r lg:from-black/75 lg:via-black/25 lg:to-transparent"
        ></div>
      </div>

      <div
        class="page-gutter relative z-10 grid w-full items-end gap-8 pb-10 pt-[46svh] lg:grid-cols-[minmax(0,1fr)_280px] lg:pt-40"
      >
        <div
          class="flex min-w-0 flex-col items-center text-center lg:items-start lg:text-left"
        >
          <img
            v-if="logo"
            :src="img(logo, 'w500')"
            :alt="title"
            class="max-h-28 max-w-[80vw] object-contain drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)] lg:max-h-40 lg:max-w-[500px] lg:object-left"
          />
          <h1
            v-else
            class="max-w-3xl text-4xl font-black leading-tight drop-shadow-lg lg:text-6xl"
          >
            {{ title }}
          </h1>

          <p
            v-if="media.genres?.length"
            class="mt-4 flex flex-wrap items-center justify-center gap-x-3 text-lg font-medium text-white/90 lg:justify-start"
          >
            <template v-for="(genre, i) in media.genres.slice(0, 3)" :key="genre.id">
              <span v-if="i" class="text-white/40">•</span>
              <NuxtLink
                :to="`/category/${type}/genre-${genre.id}`"
                class="hover:underline"
              >
                {{ genre.name }}
              </NuxtLink>
            </template>
          </p>

          <div class="mt-6 flex items-center gap-3">
            <button
              class="flex h-11 items-center gap-2 rounded-full bg-white px-7 font-semibold text-black shadow-lg transition hover:scale-105"
              @click="scrollToPlayer"
            >
              <Play class="h-5 w-5 fill-current" /> Play
            </button>
            <button
              class="action-btn"
              :aria-label="inList ? 'Remove from watchlist' : 'Add to watchlist'"
              :title="inList ? 'In Watchlist' : 'Add to Watchlist'"
              @click="library.toggleWatchlist(media, type)"
            >
              <Check v-if="inList" class="h-5 w-5 text-accent-hot" />
              <Plus v-else class="h-5 w-5" />
            </button>
            <button
              v-if="account.state.isLoggedIn"
              class="action-btn"
              :aria-label="isFavorite ? 'Unlike' : 'Like'"
              @click="toggleFavorite"
            >
              <Heart
                class="h-5 w-5"
                :class="{ 'fill-current text-accent-hot': isFavorite }"
              />
            </button>
            <button
              v-if="!party?.partyRoom"
              class="action-btn"
              aria-label="Start a watch party"
              title="Watch Party"
              @click="party?.startParty()"
            >
              <Users class="h-5 w-5" />
            </button>
          </div>

          <div
            class="mt-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-lg text-white/90 lg:justify-start"
          >
            <span v-if="years">{{ years }}</span>
            <span v-if="runtime">{{ runtime }}</span>
            <span
              v-if="certification"
              class="rounded border border-white/40 px-1.5 text-sm font-semibold"
            >
              {{ certification }}
            </span>
            <span v-if="media.vote_average" class="flex items-center gap-1">
              <Star class="h-4 w-4 fill-current text-yellow-400" />
              {{ media.vote_average.toFixed(1) }}
            </span>
          </div>

          <p v-if="credit" class="mt-2 text-white/90">
            <span class="text-white/50">{{ credit.label }}:</span>
            {{ credit.name }}
          </p>

          <p
            class="mt-4 max-w-2xl leading-relaxed text-white/80"
            :class="{ 'line-clamp-3': !expanded }"
          >
            {{ media.overview }}
          </p>
          <button
            v-if="media.overview?.length > 220"
            class="mt-1 text-sm font-medium text-white/60 hover:text-white"
            @click="expanded = !expanded"
          >
            {{ expanded ? "Show Less" : "Read More" }}
          </button>
        </div>

        <aside class="w-full">
          <dl
            class="divide-y divide-white/10 overflow-hidden rounded-xl border border-white/10 bg-white/5 text-xs backdrop-blur-md"
          >
            <div
              v-for="fact in facts"
              :key="fact.label"
              class="flex items-center justify-between gap-4 px-4 py-3"
            >
              <dt class="text-white/50">{{ fact.label }}</dt>
              <dd class="truncate text-right font-medium text-white/90">
                {{ fact.value }}
              </dd>
            </div>
          </dl>
          <div
            v-if="companies.length"
            class="mt-5 flex items-center justify-center gap-8"
          >
            <img
              v-for="company in companies"
              :key="company.id"
              :src="img(company.logo_path, 'w154')"
              :alt="company.name"
              :title="company.name"
              class="max-h-8 max-w-[110px] object-contain opacity-60 brightness-0 invert"
            />
          </div>
        </aside>
      </div>
    </section>

    <section v-if="type === 'tv' && seasons.length" class="py-5">
      <div
        class="page-gutter relative z-30 flex flex-wrap items-center justify-between gap-3"
      >
        <h2 class="text-2xl font-semibold">Episodes</h2>
        <div class="flex flex-wrap items-center gap-2">
          <button class="pill-btn" @click="ratingsOpen = true">
            <Grid3x3 class="h-4 w-4" /> Ratings
          </button>
          <button class="pill-btn" @click="newestFirst = !newestFirst">
            <ArrowUpDown class="h-4 w-4" />
            {{ newestFirst ? "Newest" : "Oldest" }}
          </button>
          <FilterDropdown
            v-model="seasonNumber"
            label="Season"
            align="right"
            :show-dot="false"
            :options="seasonOptions"
          />
        </div>
      </div>

      <MediaRow class="!py-0">
        <button
          v-for="episode in orderedEpisodes"
          :key="episode.id"
          class="group/ep w-[280px] flex-none text-left lg:w-[318px]"
          @click="scrollToPlayer"
        >
          <div
            class="relative aspect-video overflow-hidden rounded-xl bg-white/5 shadow-xl shadow-black/40"
          >
            <img
              v-if="episode.still_path"
              :src="img(episode.still_path, 'w500')"
              :alt="episode.name"
              loading="lazy"
              class="h-full w-full object-cover transition-transform duration-500 ease-hover group-hover/ep:scale-105"
            />
            <span class="ep-badge left-2 top-2">E{{ episode.episode_number }}</span>
            <span v-if="episode.runtime" class="ep-badge bottom-2 right-2">
              {{ episode.runtime }}m
            </span>
          </div>
          <h3 class="mt-3 truncate font-semibold">{{ episode.name }}</h3>
          <p class="mt-1 line-clamp-2 text-xs leading-relaxed text-white/60">
            {{ episode.overview }}
          </p>
        </button>
        <template v-if="episodesLoading">
          <div
            v-for="n in 4"
            :key="n"
            class="aspect-video w-[280px] flex-none animate-pulse rounded-xl bg-white/5 lg:w-[318px]"
          ></div>
        </template>
      </MediaRow>

      <EpisodeRatingsModal
        :open="ratingsOpen"
        :tv-id="media.id"
        :title="title"
        :seasons="seasons.map((season) => season.season_number)"
        @close="ratingsOpen = false"
      />
    </section>

    <CastRow v-if="cast.length" :cast="cast" />
    <TrailerRow v-if="trailers.length" :videos="trailers" />

    <PlayerSection :type="type" :imdb-id="imdbId" :trailer-key="trailers[0]?.key" />

    <MediaRow
      v-if="related.length"
      title="You Might Also Like"
      :items="related"
      :type="type"
    />
  </div>

  <div v-else class="grid min-h-screen place-items-center">
    <p v-if="notFound" class="text-white/60">This title could not be found.</p>
    <LoaderCircle v-else class="h-10 w-10 animate-spin text-white/40" />
  </div>
</template>

<script setup lang="ts">
import {
  ArrowUpDown,
  Check,
  Grid3x3,
  Heart,
  LoaderCircle,
  Play,
  Plus,
  Star,
  Users,
} from "lucide-vue-next";

const props = defineProps<{ type: MediaType; id: number }>();

const route = useRoute();
const library = useLibrary();
const account = useTmdbAccount();

const media = ref<any>(null);
const party = ref<any>(null);
const notFound = ref(false);
const related = ref<any[]>([]);
const expanded = ref(false);
const isFavorite = ref(false);

const seasonNumber = ref<number | null>(null);
const episodes = ref<any[]>([]);
const episodesLoading = ref(false);
const newestFirst = ref(false);
const ratingsOpen = ref(false);

const isMovie = computed(() => props.type === "movie");
const title = computed(() => titleOf(media.value));
const inList = computed(() => library.inWatchlist(props.id, props.type));

const logo = computed(() => pickLogo(media.value?.images));
const mobileArt = computed(() => pickTextlessPoster(media.value?.images));

const imdbId = computed(
  () => media.value?.imdb_id || media.value?.external_ids?.imdb_id || null
);

const years = computed(() => {
  const m = media.value;
  if (isMovie.value) return yearOf(m);
  const first = yearOf(m);
  const last = m.last_air_date?.substring(0, 4);
  if (m.status === "Ended" && last && last !== first) return `${first}–${last}`;
  return first;
});

const runtime = computed(() =>
  isMovie.value ? formatRuntime(media.value.runtime) : ""
);

const certification = computed(() => {
  const m = media.value;
  if (isMovie.value) {
    const us = m.release_dates?.results?.find((r: any) => r.iso_3166_1 === "US");
    return us?.release_dates?.find((r: any) => r.certification)?.certification || "";
  }
  return (
    m.content_ratings?.results?.find((r: any) => r.iso_3166_1 === "US")?.rating || ""
  );
});

const credit = computed(() => {
  if (isMovie.value) {
    const director = media.value.credits?.crew?.find(
      (person: any) => person.job === "Director"
    );
    return director ? { label: "Director", name: director.name } : null;
  }
  const creator = media.value.created_by?.[0];
  return creator ? { label: "Creator", name: creator.name } : null;
});

const facts = computed(() => {
  const m = media.value;
  const language = m.original_language?.toUpperCase();
  const rows = isMovie.value
    ? [
        { label: "Runtime", value: runtime.value },
        { label: "Language", value: language },
        { label: "Release Date", value: formatDate(m.release_date) },
        { label: "Budget", value: formatMoney(m.budget) },
        { label: "Revenue", value: formatMoney(m.revenue) },
      ]
    : [
        { label: "Status", value: m.status },
        { label: "Language", value: language },
        { label: "First Aired", value: formatDate(m.first_air_date) },
        { label: "Last Aired", value: formatDate(m.last_air_date) },
        { label: "Seasons", value: m.number_of_seasons },
        { label: "Episodes", value: m.number_of_episodes },
        { label: "Latest Episode", value: m.last_episode_to_air?.name },
      ];
  return rows.filter((row) => row.value);
});

const companies = computed(() => {
  const list = isMovie.value ? media.value.production_companies : media.value.networks;
  return (list || []).filter((company: any) => company.logo_path).slice(0, 2);
});

const cast = computed(() => media.value?.credits?.cast || []);

const trailers = computed(() => {
  const videos = (media.value?.videos?.results || []).filter(
    (video: any) => video.site === "YouTube"
  );
  const main = videos.filter((video: any) => video.type === "Trailer");
  const teasers = videos.filter((video: any) => video.type === "Teaser");
  return [...main, ...teasers].slice(0, 8);
});

const seasons = computed(() => {
  const all = (media.value?.seasons || []).filter(
    (season: any) => season.episode_count > 0
  );
  const regular = all.filter((season: any) => season.season_number > 0);
  return regular.length ? regular : all;
});

const seasonOptions = computed(() =>
  seasons.value.map((season: any) => ({
    value: season.season_number,
    label: season.name || `Season ${season.season_number}`,
  }))
);

const orderedEpisodes = computed(() =>
  newestFirst.value ? [...episodes.value].reverse() : episodes.value
);

function scrollToPlayer() {
  document
    .getElementById("player")
    ?.scrollIntoView({ behavior: "smooth", block: "center" });
}

async function toggleFavorite() {
  const next = !isFavorite.value;
  isFavorite.value = next;
  try {
    await account.toggleFavorite(props.type, props.id, next);
  } catch (err) {
    console.error(err);
    isFavorite.value = !next;
  }
}

async function loadEpisodes() {
  if (seasonNumber.value == null) return;
  episodesLoading.value = true;
  episodes.value = [];
  try {
    const json = await tmdbFetch(`/tv/${props.id}/season/${seasonNumber.value}`, {
      language: "en-US",
    });
    episodes.value = json.episodes || [];
  } catch (err) {
    console.error(err);
  } finally {
    episodesLoading.value = false;
  }
}

// Movies: the rest of the collection first, then similar titles
async function loadRelated() {
  try {
    if (!isMovie.value) {
      const json = await tmdbFetch(`/tv/${props.id}/recommendations`, {
        language: "en-US",
        page: 1,
      });
      related.value = (json.results || []).slice(0, 18);
      return;
    }

    let collectionParts: any[] = [];
    const collection = media.value.belongs_to_collection;
    if (collection) {
      const json = await tmdbFetch(`/collection/${collection.id}`, {
        language: "en-US",
      });
      collectionParts = json.parts || [];
    }
    const similar = await tmdbFetch(`/movie/${props.id}/similar`, {
      language: "en-US",
      page: 1,
    });

    const seen = new Set([props.id]);
    const unique = [];
    for (const item of [...collectionParts, ...(similar.results || [])]) {
      if (seen.has(item.id) || !item.poster_path) continue;
      seen.add(item.id);
      unique.push(item);
    }
    related.value = unique.slice(0, 18);
  } catch (err) {
    console.error(err);
  }
}

async function load() {
  const extras = isMovie.value
    ? "release_dates,images,credits,videos,external_ids"
    : "content_ratings,images,credits,videos,external_ids";
  const json = await tmdbFetch(`/${props.type}/${props.id}`, {
    language: "en-US",
    append_to_response: extras,
    include_image_language: "en,null",
  });
  if (!json?.id) {
    notFound.value = true;
    return;
  }
  media.value = json;

  setAmbientFromImage(json.backdrop_path || json.poster_path);
  library.addToHistory(json, props.type);
  loadRelated();

  if (!isMovie.value) {
    seasonNumber.value = seasons.value[0]?.season_number ?? null;
  }

  account
    .getAccountStates(props.type, props.id)
    .then((states) => (isFavorite.value = !!states?.favorite))
    .catch((err) => console.error(err));

  if (route.hash === "#player") {
    await nextTick();
    scrollToPlayer();
  }
}

watch(seasonNumber, loadEpisodes);

useHead({ title: () => title.value || "Freflix" });

onMounted(() => {
  load().catch((err) => {
    console.error(err);
    notFound.value = true;
  });
});
</script>

<style scoped>
@reference "~/assets/css/main.css";

.hero-mask {
  -webkit-mask-image: linear-gradient(to bottom, #000 55%, transparent 100%);
  mask-image: linear-gradient(to bottom, #000 55%, transparent 100%);
}

.action-btn {
  @apply grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20;
}

.pill-btn {
  @apply flex h-[38px] items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 text-sm font-medium text-white/90 backdrop-blur-md transition hover:bg-white/15;
}

.ep-badge {
  @apply absolute rounded-full bg-black/60 px-2 py-0.5 text-xs font-semibold backdrop-blur-sm;
}
</style>
