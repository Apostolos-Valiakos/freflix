<template>
  <div
    class="glass-soft inline-flex items-center gap-1 rounded-full p-1"
    role="tablist"
  >
    <button
      v-for="option in options"
      :key="option.value"
      role="tab"
      :aria-selected="option.value === modelValue"
      class="h-9 whitespace-nowrap rounded-full px-3.5 text-sm font-semibold transition-all duration-300 sm:px-5"
      :class="
        option.value === modelValue
          ? 'bg-white text-black shadow'
          : 'text-white/65 hover:text-white'
      "
      @click="emit('update:modelValue', option.value)"
    >
      {{ option.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  options: { value: string; label: string }[];
  modelValue: string;
}>();
const emit = defineEmits<{ "update:modelValue": [value: string] }>();
</script>
