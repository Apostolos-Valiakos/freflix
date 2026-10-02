type Page = { results?: any[]; total_pages?: number };

// Paged list that loads the next page when its sentinel element scrolls into view
export function useInfiniteList(
  fetchPage: (page: number) => Promise<Page>,
  maxPages = 500
) {
  const items = ref<any[]>([]);
  const page = ref(0);
  const totalPages = ref(1);
  const loading = ref(false);
  const sentinel = ref<HTMLElement | null>(null);

  let generation = 0;
  let observer: IntersectionObserver | null = null;
  const seen = new Set<string>();

  function sentinelVisible() {
    const el = sentinel.value;
    if (!el) return false;
    return el.getBoundingClientRect().top < window.innerHeight + 600;
  }

  async function loadNext() {
    if (loading.value || page.value >= totalPages.value) return;
    const current = generation;
    loading.value = true;
    try {
      const json = await fetchPage(page.value + 1);
      if (current !== generation) return;
      page.value += 1;
      totalPages.value = Math.min(json.total_pages || 1, maxPages);
      for (const item of json.results || []) {
        const key = `${item.media_type || item.isSerie || ""}:${item.id}`;
        if (seen.has(key)) continue;
        seen.add(key);
        items.value.push(item);
      }
    } catch (err) {
      console.error(err);
      if (current === generation) totalPages.value = page.value;
    } finally {
      if (current === generation) loading.value = false;
    }
    // Short pages can leave the sentinel on screen without a new intersection
    await nextTick();
    if (current === generation && sentinelVisible()) loadNext();
  }

  function reset() {
    generation += 1;
    seen.clear();
    items.value = [];
    page.value = 0;
    totalPages.value = 1;
    loading.value = false;
    return loadNext();
  }

  watch(sentinel, (el) => {
    observer?.disconnect();
    if (!el) return;
    observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadNext();
      },
      { rootMargin: "600px" }
    );
    observer.observe(el);
  });

  onBeforeUnmount(() => observer?.disconnect());

  return { items, loading, sentinel, reset, loadNext };
}
