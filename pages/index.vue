<template>
  <div v-if="movies && movies.length > 0 && topMovie">
    <section class="hero-section">
      <v-img
        :src="'https://image.tmdb.org/t/p/original' + topMovie.backdrop_path"
        alt="Movie Poster"
        class="movie-banner"
        lazy-src="https://via.placeholder.com/1920x1080/000000/FFFFFF?text=Loading..."
      />
      <!-- Content container - Note: Vuetify padding classes (px-4 px-md-16) are great for responsiveness -->
      <div class="content-overlay px-4 px-md-16">
        <!-- Title - Responsive font sizes -->
        <h1 class="text-h4 text-sm-h2 text-md-h1 font-weight-black mb-4">
          {{ topMovie.title }}
        </h1>

        <!-- Rating/Metadata -->
        <div class="d-flex align-center mb-4">
          <span class="text-body-2 text-sm-body-1 font-weight-medium">
            {{ new Date(topMovie.release_date).getFullYear() }}
          </span>
          <v-chip
            small
            color="red"
            outlined
            class="mx-3 text-caption text-sm-body-2"
          >
            {{ topMovie.vote_average }} / 10
          </v-chip>
        </div>

        <v-row class="my-2">
          <div v-for="genre in topMovie.genres" :key="genre.id">
            <v-chip color="red" class="mx-1 genre-chip">
              {{ genre.name }}
            </v-chip>
          </div>
        </v-row>

        <!-- Synopsis - Responsive max-width and now visible on small screens with line-clamping -->
        <p class="synopsis text-body-2 text-sm-body-1">
          {{ topMovie.overview }}
        </p>

        <!-- Buttons - Responsive sizing (using $vuetify.breakpoint) is already robust -->
        <v-form class="button-container d-flex mt-6">
          <!-- Primary Action: Play -->
          <v-btn
            :large="$vuetify.breakpoint.mdAndUp"
            :small="$vuetify.breakpoint.smAndDown"
            color="red"
            class="white--text mr-3 rounded-md font-weight-bold px-4 px-sm-8"
            @click="handleMovieClick(topMovie.id)"
          >
            <v-icon left>mdi-play</v-icon>
            Play
          </v-btn>
          <!-- Secondary Action: More Info -->
          <v-btn
            :large="$vuetify.breakpoint.mdAndUp"
            :small="$vuetify.breakpoint.smAndDown"
            color="white"
            class="white--text rounded-md font-weight-bold px-4 px-sm-8"
            @click="handleMovieClick(topMovie.id)"
          >
            <v-icon left color="red">mdi-information-outline</v-icon>
            <span style="color: red">More Info</span>
          </v-btn>
          <!-- Add to Watchlist -->
          <v-btn
            icon
            class="ml-3 rounded-circle"
            :color="isAdded ? 'red' : 'white'"
            :disabled="isAdded"
            @click="addToWatchlist(topMovie)"
          >
            <v-icon>{{ isAdded ? "mdi-check" : "mdi-plus" }}</v-icon>
          </v-btn>
        </v-form>
      </div>
    </section>
    <div style="background-color: black">
      <obras
        v-if="watchlist && watchlist.length != 0"
        :obras="watchlist"
        titulo="Watchlist"
        type="movie"
      />

      <obras
        class="mt-n3"
        v-if="newMovies"
        :obras="newMovies"
        titulo="Top Rated"
        type="movie"
      />

      <obras
        class="mt-n8"
        v-if="horrorItems"
        :obras="horrorItems"
        titulo="Horror"
        type="movie"
      />

      <obras
        class="mt-n8"
        v-if="fantasyItems"
        :obras="fantasyItems"
        titulo="Fantasy"
        type="movie"
      />

      <obras
        class="mt-n8"
        v-if="documentaryItems"
        :obras="documentaryItems"
        titulo="Documentary"
        type="movie"
      />
      <obras
        class="mt-n8"
        v-if="animationItems"
        :obras="animationItems"
        titulo="Animation"
        type="movie"
      />
    </div>
  </div>
</template>
<!-- <script
  async
  src="https://www.googletagmanager.com/gtag/js?id=G-XMRB0HFGVK"
></script> -->
<script>
window.dataLayer = window.dataLayer || [];
function gtag() {
  dataLayer.push(arguments);
}
gtag("js", new Date());

gtag("config", "G-XMRB0HFGVK");
</script>
<script>
export default {
  transition: {
    name: "layout",
    mode: "out-in",
  },

  data() {
    return {
      watchlist: null,
      isAdded: false,
      topMovie: null,
      newMovies: [],
      movies: [],
      horrorItems: [],
      fantasyItems: [],
      documentaryItems: [],
      animationItems: [],
      randomMovies: [],
      upcomingMovies: [],
      series: [],
    };
  },

  async created() {
    this.initializeWatchlist();
    await this.getTopMovie("movie");
    await this.initialize();
    localStorage.removeItem("searchFilters");
  },

  methods: {
    // API Configuration
    getApiOptions() {
      return {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization:
            "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwYjE5NTM3NWNkODk0ZGRlNzkwOGNiNzIxMmQwMTBmOCIsInN1YiI6IjY1ODdmNjU1MmRmZmQ4NWNkYjQ0ZDkwNiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.XaBBhvFBh29o9x62S5G3BJ-KVofB-_clblrCU7PUj7M",
        },
      };
    },

    // LocalStorage helpers
    initializeWatchlist() {
      const storedWatchlist = localStorage.getItem("watchlist");
      this.watchlist = storedWatchlist ? JSON.parse(storedWatchlist) : null;
    },

    // Movie data helpers
    ensureBackdropPath(list) {
      return list.map((movie) => ({
        ...movie,
        backdrop_path: movie.backdrop_path || movie.poster_path,
      }));
    },

    // Watchlist management
    addToWatchlist(movie) {
      movie.isSerie = "movie";
      let watchlist = JSON.parse(localStorage.getItem("watchlist") || "[]");

      const existingIndex = watchlist.findIndex(
        (item) => item.id === movie.id && item.isSerie === movie.isSerie
      );

      if (existingIndex >= 0) {
        watchlist.splice(existingIndex, 1);
      }

      watchlist.unshift(movie);
      localStorage.setItem("watchlist", JSON.stringify(watchlist));
      this.isAdded = true;
      this.watchlist = watchlist.length ? watchlist : null;
    },

    // Data fetching
    async fetchCategory(url) {
      try {
        const response = await fetch(url, this.getApiOptions());
        const data = await response.json();
        return this.ensureBackdropPath(data.results || []);
      } catch (error) {
        console.error(`Error fetching ${url}:`, error);
        return [];
      }
    },

    async initialize() {
      const baseUrl = "https://api.themoviedb.org/3";

      // Parallelize all fetches with Promise.all
      const [
        newMoviesData,
        horrorData,
        fantasyData,
        documentaryData,
        animationData,
      ] = await Promise.all([
        this.fetchCategory(`${baseUrl}/movie/top_rated?language=en-US&page=1`),
        this.fetchCategory(
          `${baseUrl}/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc&with_genres=27`
        ),
        this.fetchCategory(
          `${baseUrl}/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc&with_genres=14`
        ),
        this.fetchCategory(
          `${baseUrl}/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc&with_genres=99`
        ),
        this.fetchCategory(
          `${baseUrl}/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc&with_genres=16`
        ),
      ]);

      // Assign in parallel order to avoid blocking
      this.newMovies = newMoviesData;
      this.horrorItems = horrorData;
      this.fantasyItems = fantasyData;
      this.documentaryItems = documentaryData;
      this.animationItems = animationData;

      // Reuse newMovies for movies if needed (avoids duplicate fetch)
      this.movies = this.newMovies;
    },

    // Navigation
    handleMovieClick(id) {
      this.$router.push({ name: "info", query: { id } });
    },

    async getTopMovie(type) {
      try {
        const baseUrl = "https://api.themoviedb.org/3";
        const url = `${baseUrl}/discover/${type}?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc`;

        const response = await fetch(url, this.getApiOptions());
        const data = await response.json();

        if (!data.results?.length) {
          throw new Error("No movies found in the response.");
        }

        const randomIndex = Math.floor(Math.random() * data.results?.length);
        const topMovieData = data.results[randomIndex];

        this.topMovie = {
          ...topMovieData,
          isSerie: "movie",
          backdrop_path: topMovieData.backdrop_path || topMovieData.poster_path,
        };

        // Check if the top movie is already in the watchlist to set isAdded state
        const storedWatchlist = localStorage.getItem("watchlist");
        const watchlist = storedWatchlist ? JSON.parse(storedWatchlist) : [];
        const isCurrentlyAdded = watchlist.some(
          (item) =>
            item.id === this.topMovie.id &&
            item.isSerie === this.topMovie.isSerie
        );
        this.isAdded = isCurrentlyAdded;

        // Parallelize details fetch if needed (but only after setting topMovie)
        const detailsUrl = `${baseUrl}/movie/${this.topMovie.id}?language=en-US`;
        const detailsResponse = await fetch(detailsUrl, this.getApiOptions());
        const detailsData = await detailsResponse.json();
        console.log(detailsData);

        if (detailsData.imdb_id) {
          this.$set(this.topMovie, "imdb_id", detailsData.imdb_id); // Reactive update
          this.$set(this.topMovie, "genres", detailsData.genres); // Reactive update
        }
      } catch (error) {
        console.error("Error fetching top movie:", error);
      }
    },

    watchMovie(id) {
      window.location.href = `https://multiembed.mov/?video_id=${id}`;
    },
  },
};
</script>

<style>
/* Hero Section - Set to full height, content anchored to the top (flex-start)
*/
.hero-section {
  height: 100vh;
  min-height: 500px; /* Ensure a minimum height even on very small devices */
  justify-content: flex-end;
  align-items: flex-start;
  padding: 8em 2.5em; /* Desktop Padding */
  display: flex;
  flex-direction: column;
  object-fit: cover;
  position: relative;
}

/* Content Overlay - Constrain width for readability on large screens,
  but ensure it takes full width for mobile responsiveness (handled by px- classes) 
*/
.content-overlay {
  z-index: 1;
  max-width: 1200px;
  width: 100%;
  margin-left: 0 !important; /* 👈 Remove auto-centering */
  margin-right: auto !important; /* optional, keeps responsive flow */
  text-align: left !important; /* 👈 Ensure text aligns left */
}

/* Movie Banner Image */
.movie-banner {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 0;
  opacity: 0.8;
}

/* Typography Base Styles */
h1,
p {
  padding: 0;
  margin: 0;
  color: white; /* Ensure text is white for contrast */
  text-shadow: 2px 2px 4px rgb(0 0 0 / 45%);
}

h1 {
  /* H1 font size is handled by Vuetify classes in template: text-h4 text-sm-h2 text-md-h1 */
  max-width: 90%; /* Prevent title from taking up too much width */
}

.synopsis {
  /* Synopsis font size is handled by Vuetify classes in template: text-body-2 text-sm-body-1 */
  max-width: 40rem; /* Constrain max line length for better desktop readability */
  padding-top: 0.5rem;
  padding-bottom: 1rem;
}

/* Responsive Overrides for Mobile (less than 600px) */
@media (max-width: 600px) {
  .hero-section {
    /* More compact padding on mobile */
    padding-top: 10px;
    padding-bottom: 20px;
    min-height: 70vh; /* Shorter hero section on mobile */
  }

  /* Force synopsis to full width on mobile */
  .synopsis {
    max-width: 100%;
  }

  /* Button container adjustments for better touch targets */
  .button-container {
    flex-wrap: wrap;
  }
}

/* Responsive Overrides for Tablet (less than 960px) */
@media (max-width: 960px) {
  .hero-section {
    padding: 3em 1.5em;
  }
}

/* Other general styles remain */
.v-window.v-item-group.theme--dark.v-window--show-arrows-on-hover.v-carousel {
  height: 400px !important;
}
</style>
