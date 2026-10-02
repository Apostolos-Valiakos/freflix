<template>
  <div>
    <HeroSlider type="all" />

    <div class="relative z-10 -mt-4 lg:-mt-16">
      <ProviderStrip />

      <MediaRow
        v-if="library.recentHistory.value.length"
        title="Continue Watching"
        :items="library.recentHistory.value.slice(0, 20)"
        view-all="/lists?tab=history"
      />
      <MediaRow
        v-if="library.watchlist.value.length"
        title="My Watchlist"
        :items="library.watchlist.value.slice(0, 20)"
        view-all="/lists"
      />
      <MediaRow
        v-if="recommendations.length"
        title="Recommended for You"
        :items="recommendations"
      />

      <TmdbRow
        title="Trending Movies"
        path="/trending/movie/day"
        type="movie"
        view-all="/category/movie/trending"
      />
      <TmdbRow
        title="Trending Series"
        path="/trending/tv/day"
        type="tv"
        view-all="/category/tv/trending"
      />

      <ProviderRow type="movie" />
      <ProviderRow type="tv" />

      <TmdbRow
        title="Top Rated Movies"
        path="/movie/top_rated"
        type="movie"
        view-all="/category/movie/top-rated"
      />
      <TmdbRow
        title="Top Rated Series"
        path="/tv/top_rated"
        type="tv"
        view-all="/category/tv/top-rated"
      />

      <TmdbRow
        v-for="genre in genreRows"
        :key="genre.id"
        :title="genre.title"
        path="/discover/movie"
        :params="{ with_genres: genre.id, sort_by: 'popularity.desc' }"
        type="movie"
        :view-all="`/category/movie/genre-${genre.id}`"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const library = useLibrary();
const account = useTmdbAccount();
const recommendations = ref<any[]>([]);

const genreRows = [
  { id: 28, title: "Action" },
  { id: 35, title: "Comedy" },
  { id: 27, title: "Horror" },
  { id: 878, title: "Science Fiction" },
  { id: 14, title: "Fantasy" },
  { id: 16, title: "Animation" },
  { id: 99, title: "Documentary" },
];

onMounted(() => {
  if (!account.state.isLoggedIn) return;
  account
    .getPersonalizedRecommendations()
    .then((recs) => (recommendations.value = recs))
    .catch((err) => console.error(err));
});
</script>
