<template>
  <div ref="root" class="relative">
    <button
      v-if="variant === 'inline'"
      class="flex items-center gap-1.5 text-white"
      @click="open = !open"
    >
      <span class="underline decoration-white/50 underline-offset-4">{{
        selected?.label || label
      }}</span>
      <ChevronDown
        class="h-4 w-4 text-white/60 transition-transform"
        :class="{ 'rotate-180': open }"
      />
    </button>
    <button
      v-else
      class="glass-soft flex h-[38px] min-w-[120px] items-center justify-between gap-3 rounded-full px-4 text-sm font-medium text-white/90 transition hover:bg-white/15 lg:min-w-[140px]"
      @click="open = !open"
    >
      <span class="flex min-w-0 items-center gap-2">
        <span
          v-if="selected && showDot"
          class="h-1.5 w-1.5 flex-none rounded-full bg-white"
        ></span>
        <span class="truncate">{{ selected?.label || label }}</span>
      </span>
      <ChevronDown
        class="h-4 w-4 flex-none text-white/60 transition-transform"
        :class="{ 'rotate-180': open }"
      />
    </button>

    <Transition name="pop">
      <div
        v-if="open"
        class="thin-scrollbar absolute z-40 mt-2 max-h-[300px] min-w-[180px] overflow-y-auto rounded-xl border border-white/10 bg-raised py-1 shadow-2xl"
        :class="align === 'right' ? 'right-0' : 'left-0'"
      >
        <button
          v-if="allLabel"
          class="option"
          :class="{ 'bg-white/5 text-white': modelValue == null }"
          @click="select(null)"
        >
          {{ allLabel }}
          <Check v-if="modelValue == null" class="h-4 w-4" />
        </button>
        <button
          v-for="option in options"
          :key="option.value"
          class="option"
          :class="{ 'bg-white/5 text-white': option.value === modelValue }"
          @click="select(option.value)"
        >
          <span class="flex items-center gap-3">
            <img
              v-if="option.logo"
              :src="option.logo"
              alt=""
              class="h-6 w-6 rounded-full object-cover"
            />
            {{ option.label }}
          </span>
          <Check v-if="option.value === modelValue" class="h-4 w-4" />
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { Check, ChevronDown } from "lucide-vue-next";

type Option = { value: string | number; label: string; logo?: string };

const props = withDefaults(
  defineProps<{
    label: string;
    options: Option[];
    modelValue: string | number | null;
    allLabel?: string;
    variant?: "pill" | "inline";
    align?: "left" | "right";
    showDot?: boolean;
  }>(),
  { allLabel: "", variant: "pill", align: "left", showDot: true }
);

const emit = defineEmits<{
  "update:modelValue": [value: string | number | null];
}>();

const open = ref(false);
const root = ref<HTMLElement | null>(null);

const selected = computed(() =>
  props.options.find((option) => option.value === props.modelValue)
);

function select(value: string | number | null) {
  emit("update:modelValue", value);
  open.value = false;
}

useClickOutside(root, () => (open.value = false));
</script>

<style scoped>
@reference "~/assets/css/main.css";

.option {
  @apply flex w-full items-center justify-between gap-4 whitespace-nowrap px-4 py-2.5 text-left text-sm font-medium text-white/75 transition hover:bg-white/5 hover:text-white;
}
</style>
