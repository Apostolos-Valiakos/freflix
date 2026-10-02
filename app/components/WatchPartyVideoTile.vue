<template>
  <div class="relative min-h-[90px] overflow-hidden rounded bg-black">
    <video
      ref="video"
      autoplay
      playsinline
      :muted="muted"
      class="block h-full w-full object-cover"
    ></video>
    <span
      class="absolute bottom-1 left-1.5 text-[0.7rem] text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.8)]"
    >
      {{ label }}
    </span>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{ stream?: MediaStream | null; muted?: boolean; label?: string }>(),
  { stream: null, muted: false, label: "" }
);

const video = ref<HTMLVideoElement | null>(null);

watch(
  () => props.stream,
  (stream) => {
    nextTick(() => {
      if (video.value) video.value.srcObject = stream || null;
    });
  },
  { immediate: true }
);
</script>
