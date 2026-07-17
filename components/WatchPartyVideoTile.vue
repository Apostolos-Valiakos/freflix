<template>
  <div class="video-tile">
    <video ref="video" autoplay playsinline :muted="muted"></video>
    <span class="video-tile-label">{{ label }}</span>
  </div>
</template>

<script>
export default {
  props: {
    stream: {
      type: MediaStream,
      default: null,
    },
    muted: {
      type: Boolean,
      default: false,
    },
    label: {
      type: String,
      default: "",
    },
  },
  watch: {
    stream: {
      immediate: true,
      handler(newStream) {
        this.$nextTick(() => {
          if (this.$refs.video) {
            this.$refs.video.srcObject = newStream || null;
          }
        });
      },
    },
  },
};
</script>

<style scoped>
.video-tile {
  position: relative;
  background: #000;
  border-radius: 4px;
  overflow: hidden;
  min-height: 90px;
}

.video-tile video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.video-tile-label {
  position: absolute;
  bottom: 4px;
  left: 6px;
  color: white;
  font-size: 0.7rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
}
</style>
