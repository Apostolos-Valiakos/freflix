<template>
  <div>
    <MediaRow title="Trailers">
      <button
        v-for="video in videos"
        :key="video.key"
        class="group/trailer relative aspect-video w-[280px] flex-none overflow-hidden rounded-xl bg-white/5 text-left shadow-xl shadow-black/40 lg:w-[318px]"
        @click="activeKey = video.key"
      >
        <img
          :src="`https://i.ytimg.com/vi/${video.key}/hqdefault.jpg`"
          :alt="video.name"
          loading="lazy"
          class="h-full w-full object-cover transition-transform duration-500 ease-hover group-hover/trailer:scale-105"
        />
        <div
          class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent"
        ></div>
        <span
          class="absolute left-1/2 top-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-black opacity-0 transition group-hover/trailer:opacity-100"
        >
          <Play class="h-5 w-5 fill-current" />
        </span>
        <div class="absolute inset-x-3 bottom-3">
          <p class="truncate text-sm font-bold">{{ video.name }}</p>
          <p class="text-xs text-white/70">{{ video.type }}</p>
        </div>
      </button>
    </MediaRow>

    <BaseModal :open="!!activeKey" wide @close="activeKey = null">
      <div class="aspect-video w-full bg-black">
        <iframe
          v-if="activeKey"
          :src="`https://www.youtube.com/embed/${activeKey}?autoplay=1`"
          allow="autoplay; encrypted-media"
          allowfullscreen
          class="h-full w-full border-0"
        ></iframe>
      </div>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { Play } from "lucide-vue-next";

defineProps<{ videos: any[] }>();

const activeKey = ref<string | null>(null);
</script>
