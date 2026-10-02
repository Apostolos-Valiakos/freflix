<template>
  <MediaRow v-if="providers.length" title="Browse by Provider">
    <NuxtLink
      v-for="provider in providers"
      :key="provider.provider_id"
      :to="`/provider/${provider.provider_id}`"
      class="group/tile flex w-[76px] flex-none flex-col items-center gap-2 lg:w-[92px]"
    >
      <img
        :src="img(provider.logo_path, 'w154')"
        :alt="provider.provider_name"
        loading="lazy"
        class="aspect-square w-full rounded-2xl border border-white/10 object-cover shadow-lg shadow-black/40 transition-transform duration-300 ease-hover group-hover/tile:scale-105"
      />
      <span
        class="line-clamp-2 text-center text-xs font-medium text-white/60 transition group-hover/tile:text-white"
      >
        {{ provider.provider_name }}
      </span>
    </NuxtLink>
  </MediaRow>
</template>

<script setup lang="ts">
const providers = ref<any[]>([]);

onMounted(async () => {
  try {
    providers.value = await fetchProviders("movie", 18);
  } catch (err) {
    console.error(err);
  }
});
</script>
