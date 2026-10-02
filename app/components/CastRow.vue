<template>
  <MediaRow title="Cast">
    <NuxtLink
      v-for="person in cast.slice(0, 20)"
      :key="person.credit_id || person.id"
      :to="`/person/${person.id}`"
      class="group/cast flex w-[110px] flex-none flex-col items-center text-center lg:w-[148px]"
    >
      <div
        class="aspect-square w-[88px] overflow-hidden rounded-full border border-white/10 bg-white/5 shadow-lg shadow-black/40 transition-transform duration-300 ease-hover group-hover/cast:scale-105 lg:w-[112px]"
      >
        <img
          v-if="person.profile_path"
          :src="img(person.profile_path, 'w185')"
          :alt="person.name"
          loading="lazy"
          class="h-full w-full object-cover"
        />
        <div v-else class="grid h-full w-full place-items-center text-white/30">
          <User class="h-8 w-8" />
        </div>
      </div>
      <p class="mt-3 line-clamp-2 text-sm font-semibold text-white/90">
        {{ person.name }}
      </p>
      <p class="line-clamp-2 text-xs text-white/50">{{ person.character }}</p>
    </NuxtLink>
  </MediaRow>
</template>

<script setup lang="ts">
import { User } from "lucide-vue-next";

defineProps<{ cast: any[] }>();
</script>
