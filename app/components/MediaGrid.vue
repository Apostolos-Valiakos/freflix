<template>
  <div
    class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 lg:gap-6 xl:grid-cols-6"
  >
    <slot>
      <MediaCard
        v-for="item in items"
        :key="(item.media_type || item.isSerie || '') + item.id"
        :item="item"
        :type="type"
      />
    </slot>
    <template v-if="loading">
      <div
        v-for="n in skeletons"
        :key="'s' + n"
        class="aspect-[2/3] animate-pulse rounded-xl bg-white/5"
      ></div>
    </template>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    items?: any[];
    type?: MediaType;
    loading?: boolean;
    skeletons?: number;
  }>(),
  { items: () => [], type: undefined, skeletons: 12 }
);
</script>
