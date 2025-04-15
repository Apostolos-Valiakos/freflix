<template>
  <div class="ml-8" @keyup.right="nextPage" @keyup.left="prevPage">
    <v-card-title class="font-weight-bold pr-5 ma-0 title-text">
      {{ titulo }}
    </v-card-title>

    <v-carousel hide-delimiters show-arrows-on-hover class="carousel">
      <template v-slot:prev="{ on, attrs }">
        <v-btn icon v-bind="attrs" v-on="on" @click="prevPage">
          <v-icon>mdi-chevron-left</v-icon>
        </v-btn>
      </template>
      <template v-slot:next="{ on, attrs }">
        <v-btn icon v-bind="attrs" v-on="on" @click="nextPage">
          <v-icon>mdi-chevron-right</v-icon>
        </v-btn>
      </template>

      <v-carousel-item v-for="(el, index) in slider" :key="index" class="movie">
        <div class="d-flex align-center">
          <v-card
            v-for="(item, idx) in visibleItems"
            :key="`${index}-${idx}`"
            class="movie-card elevation-2 mx-1"
            @click="handleClick(item)"
          >
            <router-link :to="getItemRoute(item)">
              <v-img
                :src="getImageUrl(item.poster_path)"
                :lazy-src="getImageUrl(item.poster_path)"
                contain
                class="movie-poster"
              />
            </router-link>
          </v-card>
        </div>
      </v-carousel-item>
    </v-carousel>
  </div>
</template>

<script>
const API_CONFIG = {
  baseUrl: "https://api.themoviedb.org/3",
  headers: {
    accept: "application/json",
    Authorization:
      "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwYjE5NTM3NWNkODk0ZGRlNzkwOGNiNzIxMmQwMTBmOCIsInN1YiI6IjY1ODdmNjU1MmRmZmQ4NWNkYjQ0ZDkwNiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.XaBBhvFBh29o9x62S5G3BJ-KVofB-_clblrCU7PUj7M",
  },
};

export default {
  props: {
    obras: {
      type: Array,
      required: true,
      default: () => [],
    },
    titulo: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      default: "movie",
    },
  },

  data: () => ({
    showEmbed: false,
    isMobile: false,
    similarMovies: [],
    items: [],
    currentIndex: 0,
    slider: [1, 2, 3, 4], // Consider making this dynamic based on items length
  }),

  computed: {
    columns() {
      const breakpoint = this.$vuetify.breakpoint;
      if (breakpoint.xl) return 5;
      if (breakpoint.lg) return 4;
      if (breakpoint.md) return 3;
      return 1;
    },

    visibleItems() {
      const start = this.currentIndex * this.columns;
      return this.items.slice(start, start + this.columns * 2);
    },
  },

  mounted() {
    this.initializeComponent();
  },

  methods: {
    initializeComponent() {
      this.items = [...this.obras];
      this.isMobile = window.innerWidth < 450;
    },

    getImageUrl(path) {
      return path ? `https://image.tmdb.org/t/p/w500${path}` : "";
    },

    getItemRoute(item) {
      const routeName = item.isSerie
        ? item.isSerie === "movie"
          ? "info"
          : "infoSeries"
        : this.type === "movie"
        ? "info"
        : "infoSeries";

      return { name: routeName, query: { id: item.id } };
    },

    async getSimilarMovies(movieId) {
      try {
        const url = `${API_CONFIG.baseUrl}/movie/${movieId}/recommendations?language=en-US&page=1`;
        const response = await fetch(url, {
          method: "GET",
          headers: API_CONFIG.headers,
        });
        const data = await response.json();

        if (data.results?.length) {
          this.similarMovies = data.results.slice(1);
        }
      } catch (error) {
        console.error("Error fetching similar movies:", error);
      }
    },

    handleClick(item) {
      this.$router.push(this.getItemRoute(item));
    },

    prevPage() {
      this.currentIndex = Math.max(0, this.currentIndex - 1);
    },

    nextPage() {
      const maxIndex = Math.ceil(this.items.length / this.columns) - 1;
      this.currentIndex = Math.min(maxIndex, this.currentIndex + 1);
    },
  },
};
</script>

<style scoped>
.title-text {
  color: #e5e5e5;
  font-size: 27px !important;
}

.carousel {
  white-space: nowrap;
  display: inline-block;
  overflow: hidden;
}

.movie-card {
  min-width: 250px;
  max-width: 250px;
  height: 375px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  overflow: hidden;
  border-radius: 8px;
  border: none;
  transform-origin: center;
  cursor: pointer;
}

.movie-card:hover {
  transform: scale(1.1);
  box-shadow: 0px 10px 20px rgba(0, 0, 0, 0.3);
  z-index: 19999;
}

.movie-poster {
  min-width: 250px;
  max-width: 250px;
  transition: transform 0.3s;
  overflow: hidden;
  border: none;
  border-radius: 8px;
  margin: 0;
}

.v-carousel-item {
  transition: transform 0.5s ease;
}

* {
  word-break: normal;
}
</style>
