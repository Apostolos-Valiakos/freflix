<template>
  <section class="group/row relative py-5">
    <div class="page-gutter relative z-20 mb-2 flex items-center justify-between">
      <h2
        class="flex flex-wrap items-center gap-2 text-xl font-semibold text-white/90 drop-shadow-md"
      >
        <slot name="title">{{ title }}</slot>
      </h2>
      <NuxtLink
        v-if="viewAll"
        :to="viewAll"
        class="flex flex-none items-center gap-1 text-sm font-medium text-white/60 transition hover:text-white"
      >
        View All <ArrowRight class="h-4 w-4" />
      </NuxtLink>
    </div>

    <div class="relative">
      <div
        ref="scroller"
        class="page-gutter no-scrollbar flex gap-4 overflow-x-auto py-4"
        @scroll.passive="updateArrows"
      >
        <slot>
          <template v-if="items.length">
            <MediaCard
              v-for="item in items"
              :key="mediaTypeOf(item, type) + item.id"
              :item="item"
              :type="type"
              class="w-[140px] flex-none lg:w-[200px]"
            />
          </template>
          <template v-else-if="loading">
            <div
              v-for="n in 8"
              :key="n"
              class="aspect-[2/3] w-[140px] flex-none animate-pulse rounded-xl bg-white/5 lg:w-[200px]"
            ></div>
          </template>
        </slot>
      </div>

      <button
        v-show="canLeft"
        aria-label="Scroll left"
        class="row-arrow left-0 bg-gradient-to-r"
        @click="scrollBy(-1)"
      >
        <ChevronLeft class="h-8 w-8" />
      </button>
      <button
        v-show="canRight"
        aria-label="Scroll right"
        class="row-arrow right-0 bg-gradient-to-l"
        @click="scrollBy(1)"
      >
        <ChevronRight class="h-8 w-8" />
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-vue-next";

const props = withDefaults(
  defineProps<{
    title?: string;
    items?: any[];
    type?: MediaType;
    viewAll?: string;
    loading?: boolean;
  }>(),
  { title: "", items: () => [], type: undefined, viewAll: "" }
);

const scroller = ref<HTMLElement | null>(null);
const canLeft = ref(false);
const canRight = ref(false);

function updateArrows() {
  const el = scroller.value;
  if (!el) return;
  canLeft.value = el.scrollLeft > 8;
  canRight.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 8;
}

function scrollBy(direction: number) {
  const el = scroller.value;
  if (!el) return;
  el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: "smooth" });
}

watch(
  () => props.items.length,
  () => nextTick(updateArrows)
);
onMounted(() => {
  updateArrows();
  window.addEventListener("resize", updateArrows);
});
onBeforeUnmount(() => window.removeEventListener("resize", updateArrows));
</script>

<style scoped>
@reference "~/assets/css/main.css";

.row-arrow {
  @apply absolute inset-y-0 z-10 hidden w-16 items-center justify-center from-black/70 to-transparent text-white opacity-0 transition-opacity duration-300 group-hover/row:opacity-100 lg:flex;
}
</style>
