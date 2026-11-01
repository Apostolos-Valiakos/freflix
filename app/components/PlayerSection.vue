<template>
  <section id="player" class="page-gutter scroll-mt-24 py-8">
    <div
      ref="wrapper"
      class="player-wrapper mx-auto max-w-[1100px] overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl shadow-black/60"
    >
      <div class="flex flex-wrap items-center justify-between gap-3 p-3">
        <SegmentedControl v-model="tab" :options="tabs" />
        <div class="flex items-center gap-2">
          <SegmentedControl
            v-if="tab === 'greek' && sources.length > 1"
            :model-value="String(sourceIndex)"
            :options="sourceOptions"
            @update:model-value="sourceIndex = Number($event)"
          />
          <span
            v-if="tab === 'nosubs' && type === 'tv'"
            class="text-sm font-semibold text-white/70"
          >
            S{{ season }} E{{ episode }}
          </span>
          <button
            class="glass-soft grid h-11 w-11 place-items-center rounded-full text-white/80 transition hover:text-white"
            :aria-label="isFullscreen ? 'Exit fullscreen' : 'Fullscreen'"
            @click="toggleFullscreen"
          >
            <Minimize v-if="isFullscreen" class="h-5 w-5" />
            <Maximize v-else class="h-5 w-5" />
          </button>
        </div>
      </div>

      <div
        v-if="tab === 'nosubs'"
        class="flex items-center gap-3 px-3 pb-3"
      >
        <span class="flex-none text-sm font-medium text-white/60">Server</span>
        <SegmentedControl
          class="no-scrollbar min-w-0 max-w-full overflow-x-auto"
          :model-value="String(serverIndex)"
          :options="serverOptions"
          @update:model-value="serverIndex = Number($event)"
        />
      </div>

      <div
        class="player-frame relative w-full bg-black"
        :style="{ '--embed-chrome': frameChrome + 'px' }"
      >
        <template v-if="tab === 'greek'">
          <iframe
            v-if="activeSource"
            :key="activeSource.src"
            :src="activeSource.src"
            :sandbox="activeSource.sandbox"
            allowfullscreen
            scrolling="no"
            class="player-embed"
          ></iframe>
          <p v-else class="player-message">
            No sources available for this title.
          </p>
        </template>

        <template v-else-if="tab === 'nosubs'">
          <iframe
            v-if="serverSrc"
            :key="serverSrc"
            :src="serverSrc"
            :sandbox="SERVERS[serverIndex]?.sandbox"
            allowfullscreen
            scrolling="no"
            class="player-embed"
          ></iframe>
          <p v-else class="player-message">
            No servers available for this title.
          </p>
        </template>

        <template v-else>
          <iframe
            v-if="trailerKey"
            :src="`https://www.youtube.com/embed/${trailerKey}`"
            allowfullscreen
            class="player-embed"
          ></iframe>
          <p v-else class="player-message">Trailer not available.</p>
        </template>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Maximize, Minimize } from "lucide-vue-next";

const props = withDefaults(
  defineProps<{
    type: MediaType;
    imdbId?: string | null;
    tmdbId?: number | null;
    trailerKey?: string | null;
    season?: number;
    episode?: number;
  }>(),
  { imdbId: null, tmdbId: null, trailerKey: null, season: 1, episode: 1 },
);

// The "No subs" servers, in the order they are listed. `idType` says which id the server's URLs take.
const SERVERS: {
  name: string;
  idType: "imdb" | "tmdb";
  // Pop-ups are blocked by this; set it only on servers that still play inside a sandbox
  sandbox?: string;
  movie: (id: string | number) => string;
  tv: (id: string | number, season: number, episode: number) => string;
}[] = [
  {
    name: "moviesapi",
    idType: "tmdb",
    sandbox: "allow-scripts allow-same-origin allow-forms allow-presentation",
    movie: (id) => `https://moviesapi.to/movie/${id}`,
    tv: (id, s, e) => `https://moviesapi.to/tv/${id}/${s}/${e}`,
  },
  {
    name: "vidsrc",
    idType: "tmdb",
    movie: (id) =>
      `https://embed.vidsrc.si/embed/movie/${id}?autoplay=1&ds_lang=el`,
    tv: (id, s, e) =>
      `https://embed.vidsrc.si/embed/tv/${id}/${s}/${e}?autoplay=1&ds_lang=el`,
  },
  {
    name: "multiembed",
    idType: "imdb",
    movie: (id) => `https://multiembed.mov/?video_id=${id}`,
    tv: (id, s, e) => `https://multiembed.mov/?video_id=${id}&s=${s}&e=${e}`,
  },
];

// `chrome` is the height of the embed's own toolbar above its 16:9 video
type Source = { src: string; sandbox?: string; chrome?: number };

const COVERAPI_CHROME = 35;

const tab = ref("greek");
const sourceIndex = ref(0);
const serverIndex = ref(0);
const wrapper = ref<HTMLElement | null>(null);
const isFullscreen = ref(false);

const tabs = [
  { value: "greek", label: "Greek subs" },
  { value: "nosubs", label: "No subs" },
  { value: "trailer", label: "Trailer" },
];

const serverOptions = SERVERS.map((server, i) => ({
  value: String(i),
  label: server.name,
}));

const serverSrc = computed(() => {
  const server = SERVERS[serverIndex.value];
  const id = server?.idType === "tmdb" ? props.tmdbId : props.imdbId;
  if (!server || !id) return "";
  return props.type === "movie"
    ? server.movie(id)
    : server.tv(id, props.season, props.episode);
});

const sources = computed<Source[]>(() => {
  const id = props.imdbId;
  if (!id) return [];
  if (props.type === "movie") {
    return [
      { src: `https://coverapi.store/embed/${id}`, chrome: COVERAPI_CHROME },
      { src: `https://www.playimdb.com/title/${id}&ds_lang=el` },
    ];
  }
  return [
    {
      src: `https://coverapi.store/embed/${id}`,
      chrome: COVERAPI_CHROME,
      // Blocks the popup ads this source opens on TV titles
      sandbox: "allow-scripts allow-same-origin allow-forms allow-presentation",
    },
    { src: `https://streamimdb.ru/embed/tv/${id}` },
  ];
});

const sourceOptions = computed(() =>
  sources.value.map((_, i) => ({ value: String(i), label: `Source ${i + 1}` })),
);
const activeSource = computed(() => sources.value[sourceIndex.value]);
const frameChrome = computed(() =>
  tab.value === "greek" ? activeSource.value?.chrome || 0 : 0,
);

function toggleFullscreen() {
  if (document.fullscreenElement) {
    document.exitFullscreen();
  } else {
    wrapper.value?.requestFullscreen();
  }
}

function onFullscreenChange() {
  isFullscreen.value = document.fullscreenElement === wrapper.value;
}

watch(
  () => props.imdbId,
  () => {
    tab.value = "greek";
    sourceIndex.value = 0;
    serverIndex.value = 0;
  },
);

onMounted(() =>
  document.addEventListener("fullscreenchange", onFullscreenChange),
);
onBeforeUnmount(() =>
  document.removeEventListener("fullscreenchange", onFullscreenChange),
);
</script>

<style scoped>
@reference "~/assets/css/main.css";

.player-message {
  @apply absolute inset-0 flex items-center justify-center text-white/60;
}

.player-wrapper:fullscreen {
  @apply flex max-w-none flex-col rounded-none border-0;
}

/* 16:9 video plus the embed's own toolbar, so its controls are not cut off */
.player-frame {
  padding-bottom: calc(56.25% + var(--embed-chrome, 0px));
}

.player-embed {
  @apply absolute inset-0 h-full w-full border-0;
}

.player-wrapper:fullscreen .player-frame {
  container-type: size;
  flex: 1;
  padding-bottom: 0;
}

/* Fullscreen: as wide as fits while keeping video + toolbar inside the height */
.player-wrapper:fullscreen .player-embed {
  left: 50%;
  width: min(100%, calc((100cqh - var(--embed-chrome, 0px)) * 16 / 9));
  transform: translateX(-50%);
}
</style>
