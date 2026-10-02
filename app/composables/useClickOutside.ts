import type { Ref } from "vue";

export function useClickOutside(
  target: Ref<HTMLElement | null>,
  handler: () => void
) {
  function onPointerDown(event: Event) {
    const el = target.value;
    if (el && !el.contains(event.target as Node)) handler();
  }
  function onKeydown(event: KeyboardEvent) {
    if (event.key === "Escape") handler();
  }

  onMounted(() => {
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeydown);
  });
  onBeforeUnmount(() => {
    document.removeEventListener("pointerdown", onPointerDown);
    document.removeEventListener("keydown", onKeydown);
  });
}
