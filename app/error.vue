<template>
  <div
    class="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface text-white"
  >
    <p class="text-7xl font-black text-white/20">{{ error?.statusCode }}</p>
    <h1 class="text-2xl font-semibold">
      {{ error?.statusCode === 404 ? "Page not found" : "An error occurred" }}
    </h1>
    <button
      class="mt-2 h-11 rounded-full bg-white px-6 font-semibold text-black"
      @click="clearError({ redirect: '/' })"
    >
      Home page
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{ error: { statusCode?: number } | null }>();
</script>
