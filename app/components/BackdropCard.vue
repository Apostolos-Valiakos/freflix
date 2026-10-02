<template>
  <NuxtLink :to="linkOf(item, type)" class="group/card block flex-none">
    <div
      class="relative aspect-video overflow-hidden rounded-xl bg-white/5 shadow-xl shadow-black/40"
    >
      <img
        v-if="item.backdrop_path"
        :src="img(item.backdrop_path, 'w780')"
        :alt="titleOf(item)"
        loading="lazy"
        class="h-full w-full object-cover transition-transform duration-500 ease-hover group-hover/card:scale-105"
      />
      <div
        class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"
      ></div>
      <span
        v-if="badge"
        class="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-t-md bg-accent px-3 py-1 text-xs font-semibold"
      >
        {{ badge }}
      </span>
    </div>
    <p class="mt-2 truncate text-sm font-medium text-white/90">
      {{ titleOf(item) }}
    </p>
    <p v-if="date" class="flex items-center gap-1.5 text-xs text-white/50">
      <Calendar class="h-3 w-3" /> {{ date }}
    </p>
  </NuxtLink>
</template>

<script setup lang="ts">
import { Calendar } from "lucide-vue-next";

const props = defineProps<{ item: any; type?: MediaType; badge?: string }>();

const date = computed(() =>
  formatDate(props.item.release_date || props.item.first_air_date)
);
</script>
