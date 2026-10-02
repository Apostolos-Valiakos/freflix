<template>
  <section
    class="relative h-[86svh] min-h-[560px] w-full overflow-hidden lg:h-[89svh]"
    @mouseenter="paused = true"
    @mouseleave="paused = false"
    @touchstart.passive="onTouchStart"
    @touchend.passive="onTouchEnd"
  >
    <div class="hero-mask absolute inset-0">
      <template v-for="(slide, i) in slides" :key="slide.id">
        <picture v-if="shouldRender(i)">
          <source
            media="(max-width: 767px)"
            :srcset="img(slide.mobileArt || slide.backdrop_path, 'w780')"
          />
          <img
            :src="img(slide.backdrop_path, 'w1280')"
            alt=""
            class="absolute inset-0 h-full w-full object-cover object-top transition-opacity duration-1000"
            :class="i === index ? 'opacity-100' : 'opacity-0'"
          />
        </picture>
      </template>
      <div
        class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/30 lg:bg-gradient-to-r lg:from-black/65 lg:via-black/15 lg:to-transparent"
      ></div>
    </div>

    <div
      v-if="current"
      :key="current.id"
      class="hero-content page-gutter absolute inset-x-0 bottom-[13%] flex flex-col items-center text-center lg:bottom-[16%] lg:items-start lg:text-left"
    >
      <img
        v-if="current.logo"
        :src="img(current.logo, 'w500')"
        :alt="titleOf(current)"
        class="max-h-28 max-w-[80vw] object-contain drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)] lg:max-h-40 lg:max-w-[500px] lg:object-left"
      />
      <h1
        v-else
        class="max-w-3xl text-4xl font-black leading-tight drop-shadow-lg lg:text-6xl"
      >
        {{ titleOf(current) }}
      </h1>

      <div
        class="mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 font-semibold text-white/90 lg:justify-start"
      >
        <span v-if="current.vote_average" class="flex items-center gap-1.5">
          <Star class="h-4 w-4 fill-current" />
          {{ current.vote_average.toFixed(1) }}/10
        </span>
        <span v-if="yearOf(current)" class="flex items-center gap-1.5">
          <span class="text-white/40">•</span>
          <Calendar class="h-4 w-4" /> {{ yearOf(current) }}
        </span>
        <span v-if="current.genres?.length" class="flex items-center gap-1.5">
          <span class="text-white/40">•</span>
          {{ current.genres[0].name }}
        </span>
      </div>

      <p
        class="mt-4 line-clamp-2 max-w-xl text-base font-medium leading-relaxed text-white/95 drop-shadow-md lg:line-clamp-3 lg:text-lg"
      >
        {{ current.overview }}
      </p>

      <div class="mt-7 flex items-center gap-3">
        <NuxtLink
          :to="{ path: linkOf(current), hash: '#player' }"
          class="flex h-13 items-center gap-2 rounded-full bg-white px-7 text-lg font-semibold text-black shadow-lg transition hover:scale-105"
        >
          <Play class="h-5 w-5 fill-current" /> Play
        </NuxtLink>
        <div class="glass-soft flex h-13 items-center rounded-full px-2">
          <button
            class="grid h-10 w-11 place-items-center rounded-full transition hover:bg-white/10"
            :aria-label="inList ? 'Remove from watchlist' : 'Add to watchlist'"
            @click="library.toggleWatchlist(current, current.isSerie)"
          >
            <Check v-if="inList" class="h-6 w-6 text-accent-hot" />
            <Plus v-else class="h-6 w-6" />
          </button>
          <span class="h-6 w-px bg-white/20"></span>
          <NuxtLink
            :to="linkOf(current)"
            aria-label="More Info"
            class="grid h-10 w-11 place-items-center rounded-full transition hover:bg-white/10"
          >
            <Info class="h-6 w-6" />
          </NuxtLink>
        </div>
      </div>
    </div>

    <div
      v-if="slides.length > 1"
      class="absolute bottom-[5%] left-1/2 flex -translate-x-1/2 items-center gap-2 lg:bottom-[28%] lg:left-auto lg:right-16 lg:translate-x-0"
    >
      <button
        v-for="(slide, i) in slides"
        :key="slide.id"
        :aria-label="`Go to slide ${i + 1}`"
        class="h-2 rounded-full transition-all duration-500"
        :class="i === index ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/70'"
        @click="goTo(i)"
      ></button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Calendar, Check, Info, Play, Plus, Star } from "lucide-vue-next";

const props = defineProps<{ type: MediaType | "all" }>();

const SLIDE_COUNT = 7;
const INTERVAL = 8000;

const library = useLibrary();
const slides = ref<any[]>([]);
const index = ref(0);
const paused = ref(false);
const visited = new Set<number>([0]);

let timer: ReturnType<typeof setInterval> | null = null;
let touchStartX = 0;

const current = computed(() => slides.value[index.value]);
const inList = computed(
  () =>
    !!current.value &&
    library.inWatchlist(current.value.id, current.value.isSerie)
);

// Only load artwork for slides that are showing, were shown, or come next
function shouldRender(i: number) {
  return visited.has(i) || i === (index.value + 1) % slides.value.length;
}

function goTo(i: number) {
  visited.add(i);
  index.value = i;
  startTimer();
}

function step(direction: number) {
  const count = slides.value.length;
  if (count) goTo((index.value + direction + count) % count);
}

function startTimer() {
  if (timer) clearInterval(timer);
  timer = setInterval(() => {
    if (!paused.value && !document.hidden) step(1);
  }, INTERVAL);
}

function onTouchStart(event: TouchEvent) {
  touchStartX = event.touches[0]!.clientX;
}

function onTouchEnd(event: TouchEvent) {
  const delta = event.changedTouches[0]!.clientX - touchStartX;
  if (Math.abs(delta) > 60) step(delta < 0 ? 1 : -1);
}

function shuffle<T>(list: T[]): T[] {
  const result = [...list];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j]!, result[i]!];
  }
  return result;
}

async function load() {
  const json = await tmdbFetch(`/trending/${props.type}/day`, {
    language: "en-US",
  });
  // A different pick from today's trending list on every page load
  slides.value = shuffle(
    (json.results || []).filter(
      (item: any) => item.backdrop_path && item.media_type !== "person"
    )
  )
    .slice(0, SLIDE_COUNT)
    .map((item: any) => ({
      ...item,
      isSerie: mediaTypeOf(item, props.type === "all" ? undefined : props.type),
    }));

  // Title logos and genres come from each title's detail record
  slides.value.forEach(async (slide, i) => {
    try {
      const details = await tmdbFetch(`/${slide.isSerie}/${slide.id}`, {
        append_to_response: "images",
        include_image_language: "en,null",
      });
      slides.value[i] = {
        ...slides.value[i],
        genres: details.genres,
        logo: pickLogo(details.images),
        mobileArt: pickTextlessPoster(details.images),
      };
    } catch (err) {
      console.error(err);
    }
  });
}

watch(
  () => current.value?.backdrop_path,
  (path) => path && setAmbientFromImage(path)
);

onMounted(() => {
  load()
    .then(startTimer)
    .catch((err) => console.error(err));
});

onBeforeUnmount(() => {
  if (timer) clearInterval(timer);
});
</script>

<style scoped>
.hero-mask {
  -webkit-mask-image: linear-gradient(to bottom, #000 58%, transparent 100%);
  mask-image: linear-gradient(to bottom, #000 58%, transparent 100%);
}

.hero-content {
  animation: hero-in 0.7s cubic-bezier(0.25, 1, 0.5, 1) both;
}

@keyframes hero-in {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
}
</style>
