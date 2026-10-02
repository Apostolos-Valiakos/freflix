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
          <p v-else class="player-message">No sources available for this title.</p>
        </template>

        <div v-else-if="tab === 'nosubs'" class="player-message">
          <button
            class="flex h-12 items-center gap-2 rounded-full bg-accent px-6 font-semibold text-white transition hover:bg-accent-hot"
            @click="openExternal"
          >
            <ExternalLink class="h-5 w-5" /> Watch in external player
          </button>
        </div>

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
import { ExternalLink, Maximize, Minimize } from "lucide-vue-next";

const props = defineProps<{
  type: MediaType;
  imdbId?: string | null;
  trailerKey?: string | null;
}>();

// `chrome` is the height of the embed's own toolbar above its 16:9 video
type Source = { src: string; sandbox?: string; chrome?: number };

const COVERAPI_CHROME = 35;

const tab = ref("greek");
const sourceIndex = ref(0);
const wrapper = ref<HTMLElement | null>(null);
const isFullscreen = ref(false);

const tabs = computed(() =>
  props.type === "movie"
    ? [
        { value: "greek", label: "Greek subs" },
        { value: "nosubs", label: "No subs" },
        { value: "trailer", label: "Trailer" },
      ]
    : [
        { value: "greek", label: "Greek subs" },
        { value: "trailer", label: "Trailer" },
      ]
);

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
  sources.value.map((_, i) => ({ value: String(i), label: `Source ${i + 1}` }))
);
const activeSource = computed(() => sources.value[sourceIndex.value]);
const frameChrome = computed(() =>
  tab.value === "greek" ? activeSource.value?.chrome || 0 : 0
);

function openExternal() {
  window.open(
    `https://multiembed.mov/directstream.php?video_id=${props.imdbId}`,
    "_blank"
  );
}

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
  }
);

onMounted(() =>
  document.addEventListener("fullscreenchange", onFullscreenChange)
);
onBeforeUnmount(() =>
  document.removeEventListener("fullscreenchange", onFullscreenChange)
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
