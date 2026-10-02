<template>
  <Transition name="fade">
    <button
      v-if="visible"
      aria-label="Scroll to top"
      class="fixed bottom-24 right-4 z-40 grid h-11 w-11 place-items-center rounded-full border-2 border-accent bg-black/60 text-white backdrop-blur-md transition hover:bg-accent lg:bottom-8 lg:right-8"
      @click="scrollTop"
    >
      <ArrowUp class="h-5 w-5" />
    </button>
  </Transition>
</template>

<script setup lang="ts">
import { ArrowUp } from "lucide-vue-next";

const visible = ref(false);

function onScroll() {
  visible.value = window.scrollY > 500;
}

function scrollTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

onMounted(() => window.addEventListener("scroll", onScroll, { passive: true }));
onBeforeUnmount(() => window.removeEventListener("scroll", onScroll));
</script>
