export default defineNuxtPlugin(() => {
  initTmdb(useRuntimeConfig().public.tmdbToken);
  restoreTmdbSession();
  loadLibrary();
});
