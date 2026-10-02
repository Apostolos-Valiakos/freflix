<template>
  <NuxtLink
    :to="linkOf(item, type)"
    :aria-label="title"
    class="group/card block transition-transform duration-500 ease-hover hover:z-10 lg:hover:scale-105"
  >
    <div
      class="relative isolate overflow-hidden bg-white/5 shadow-xl shadow-black/40"
      :class="isPerson ? 'aspect-square rounded-full' : 'aspect-[2/3] rounded-xl'"
    >
      <img
        v-if="image"
        :src="image"
        :alt="title"
        loading="lazy"
        class="block h-full w-full object-cover transition-all duration-300 lg:group-hover/card:brightness-50"
      />
      <div
        v-else
        class="flex h-full items-center justify-center p-3 text-center text-sm font-medium text-white/60"
      >
        {{ title }}
      </div>

      <div
        v-if="!isPerson"
        class="absolute inset-0 hidden translate-y-4 flex-col items-center justify-center p-4 opacity-0 transition-all duration-300 group-hover/card:translate-y-0 group-hover/card:opacity-100 lg:flex"
      >
        <span
          class="mb-3 rounded-full bg-white p-3 text-black shadow-lg shadow-white/20"
          aria-hidden="true"
        >
          <Play class="h-6 w-6 fill-current" />
        </span>
        <h3
          class="line-clamp-2 text-center text-sm font-bold leading-tight drop-shadow-md"
        >
          {{ title }}
        </h3>
        <div
          class="mt-1 flex items-center justify-center gap-2 text-xs font-medium text-white/80"
        >
          <span v-if="year">{{ year }}</span>
          <span v-if="item.vote_average" class="flex items-center gap-0.5">
            <Star class="h-3 w-3 fill-current text-yellow-400" />
            {{ item.vote_average.toFixed(1) }}
          </span>
        </div>
      </div>

      <slot />
    </div>
    <p
      v-if="isPerson || showTitle"
      class="mt-2 truncate text-center text-sm font-medium text-white/80"
    >
      {{ title }}
    </p>
  </NuxtLink>
</template>

<script setup lang="ts">
import { Play, Star } from "lucide-vue-next";

const props = defineProps<{
  item: any;
  type?: MediaType;
  showTitle?: boolean;
}>();

const isPerson = computed(() => props.item.media_type === "person");
const title = computed(() => titleOf(props.item));
const year = computed(() => yearOf(props.item));
const image = computed(() =>
  img(isPerson.value ? props.item.profile_path : props.item.poster_path, "w342")
);
</script>
