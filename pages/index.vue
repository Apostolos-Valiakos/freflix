<template>
  <div v-if="movies && movies.length > 0 && topMovie">
    <section class="hero-section">
      <v-img
        :src="'https://image.tmdb.org/t/p/original' + topMovie.backdrop_path"
        alt="Movie Poster"
        class="movie-banner"
        lazy-src="https://via.placeholder.com/1920x1080/000000/FFFFFF?text=Loading..."
      />
      <div class="content-overlay px-4 px-md-16">
        <h1 class="text-h4 text-sm-h2 text-md-h1 font-weight-black mb-4">
          {{ topMovie.title }}
        </h1>

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

        <p class="synopsis text-body-2 text-sm-body-1">
          {{ topMovie.overview }}
        </p>

        <v-form class="button-container d-flex mt-6">
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
        v-for="(category, index) in categories"
        :key="index"
        v-if="category.items && category.items.length > 0"
        :obras="category.items"
        :titulo="category.title"
        type="movie"
      />
    </div>
  </div>
</template>

<script>
window.dataLayer = window.dataLayer || [];
function gtag() {
  dataLayer.push(arguments);
}
gtag("js", new Date());
gtag("config", "G-XMRB0HFGVK");

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
      movies: [],
      // The configuration array for easy expansion
      categories: [
        {
          title: "Top Rated",
          endpoint: "/movie/top_rated?language=en-US&page=1",
          items: [],
        },
        {
          title: "Horror",
          endpoint: "/discover/movie?with_genres=27",
          items: [],
        },
        {
          title: "Fantasy",
          endpoint: "/discover/movie?with_genres=14",
          items: [],
        },
        {
          title: "Documentary",
          endpoint: "/discover/movie?with_genres=99",
          items: [],
        },
        {
          title: "Animation",
          endpoint: "/discover/movie?with_genres=16",
          items: [],
        },
        {
          title: "Action",
          endpoint: "/discover/movie?with_genres=28",
          items: [],
        },
        {
          title: "Comedy",
          endpoint: "/discover/movie?with_genres=35",
          items: [],
        },
        {
          title: "Science Fiction",
          endpoint: "/discover/movie?with_genres=878",
          items: [],
        },
      ],
    };
  },

  async created() {
    this.initializeWatchlist();
    await this.getTopMovie("movie");
    await this.initialize();
    localStorage.removeItem("searchFilters");
  },

  methods: {
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

    initializeWatchlist() {
      const storedWatchlist = localStorage.getItem("watchlist");
      this.watchlist = storedWatchlist ? JSON.parse(storedWatchlist) : null;
    },

    ensureBackdropPath(list) {
      return list.map((movie) => ({
        ...movie,
        backdrop_path: movie.backdrop_path || movie.poster_path,
      }));
    },

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

      // Map categories to a list of promises
      const fetchPromises = this.categories.map((cat) =>
        this.fetchCategory(`${baseUrl}${cat.endpoint}`)
      );

      // Resolve all at once
      const results = await Promise.all(fetchPromises);

      // Assign results back to the category objects
      results.forEach((data, index) => {
        this.categories[index].items = data;
      });

      // Set movies variable for the v-if check in template (using Top Rated)
      this.movies = this.categories[0].items;
    },

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

        const storedWatchlist = localStorage.getItem("watchlist");
        const watchlist = storedWatchlist ? JSON.parse(storedWatchlist) : [];
        const isCurrentlyAdded = watchlist.some(
          (item) =>
            item.id === this.topMovie.id &&
            item.isSerie === this.topMovie.isSerie
        );
        this.isAdded = isCurrentlyAdded;

        const detailsUrl = `${baseUrl}/movie/${this.topMovie.id}?language=en-US`;
        const detailsResponse = await fetch(detailsUrl, this.getApiOptions());
        const detailsData = await detailsResponse.json();

        if (detailsData.imdb_id) {
          this.$set(this.topMovie, "imdb_id", detailsData.imdb_id);
          this.$set(this.topMovie, "genres", detailsData.genres);
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
.hero-section {
  height: 100vh;
  min-height: 500px;
  justify-content: flex-end;
  align-items: flex-start;
  padding: 8em 2.5em;
  display: flex;
  flex-direction: column;
  object-fit: cover;
  position: relative;
}

.content-overlay {
  z-index: 1;
  max-width: 1200px;
  width: 100%;
  margin-left: 0 !important;
  margin-right: auto !important;
  text-align: left !important;
}

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

h1,
p {
  padding: 0;
  margin: 0;
  color: white;
  text-shadow: 2px 2px 4px rgb(0 0 0 / 45%);
}

h1 {
  max-width: 90%;
}

.synopsis {
  max-width: 40rem;
  padding-top: 0.5rem;
  padding-bottom: 1rem;
}

@media (max-width: 600px) {
  .hero-section {
    padding-top: 10px;
    padding-bottom: 20px;
    min-height: 70vh;
  }
  .synopsis {
    max-width: 100%;
  }
  .button-container {
    flex-wrap: wrap;
  }
}

@media (max-width: 960px) {
  .hero-section {
    padding: 3em 1.5em;
  }
}

.v-window.v-item-group.theme--dark.v-window--show-arrows-on-hover.v-carousel {
  height: 400px !important;
}
</style>
