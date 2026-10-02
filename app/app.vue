<template>
  <div class="min-h-screen">
    <div class="ambient-bg" aria-hidden="true"></div>
    <AppNav />
    <main class="pb-28 lg:pb-12">
      <NuxtPage />
    </main>
    <AppFooter />
    <ScrollTopButton />
  </div>
</template>

<script setup lang="ts">
import { App } from "@capacitor/app";

let backButtonHandle: { remove: () => void } | null = null;

onMounted(() => {
  App.addListener("backButton", ({ canGoBack }) => {
    if (canGoBack) {
      window.history.back();
    } else {
      App.exitApp();
    }
  }).then((handle) => {
    backButtonHandle = handle;
  });
});

onBeforeUnmount(() => backButtonHandle?.remove());
</script>
