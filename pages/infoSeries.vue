<template>
  <div style="background-color: black; min-height: 100vh">
    <section v-if="movie" class="hero-container">
      <v-img
        :src="'https://image.tmdb.org/t/p/original' + movie.poster_path"
        alt="Series Banner"
        class="movie-banner"
      >
        <div class="banner-overlay"></div>
      </v-img>

      <div class="content-wrapper">
        <v-row>
          <v-col
            cols="12"
            md="4"
            v-if="!isMobile"
            class="d-flex flex-column align-center"
          >
            <v-img
              max-width="300"
              :src="`https://image.tmdb.org/t/p/w500/${movie.poster_path}`"
              alt="Poster Image"
              class="movie-poster-img elevation-20"
            />
            <div class="mt-6 w-100 d-flex justify-center" style="width: 300px">
              <v-btn
                v-if="!isAdded"
                @click="addToWatchlist(movie)"
                color="red"
                dark
                rounded
                large
                block
                class="action-btn-main"
              >
                <v-icon left>mdi-plus</v-icon> Add to Watchlist
              </v-btn>
              <v-btn
                v-else
                @click="removeFromWatchList(movie)"
                outlined
                color="red"
                dark
                rounded
                large
                block
                class="action-btn-main"
              >
                <v-icon left>mdi-check</v-icon> In Watchlist
              </v-btn>
            </div>
          </v-col>

          <v-col
            cols="12"
            md="8"
            :class="isMobile ? 'px-6' : 'px-10'"
            class="info-column"
          >
            <div class="meta-tags d-flex align-center mb-4">
              <span class="rating-badge">
                <v-icon small color="yellow">mdi-star</v-icon>
                {{ movie.vote_average ? movie.vote_average.toFixed(1) : "N/A" }}
              </span>
              <span class="mx-3 grey--text">|</span>
              <span class="white--text">{{
                movie.first_air_date ? movie.first_air_date.substring(0, 4) : ""
              }}</span>
              <span class="mx-3 grey--text">|</span>
              <span class="white--text"
                >{{ movie.number_of_seasons }} Seasons</span
              >
            </div>

            <h1 class="movie-title-text mb-4">{{ movie.name }}</h1>
            <p class="movie-description mb-6">{{ movie.overview }}</p>

            <div class="mb-6">
              <h3 class="white--text subtitle-1 mb-2">
                Last Episode:
                <span class="red--text">{{
                  movie.last_episode_to_air
                    ? movie.last_episode_to_air.name
                    : "N/A"
                }}</span>
              </h3>
            </div>

            <div class="d-flex flex-wrap gap-4 mb-8" v-if="isMobile">
              <v-btn
                v-if="!isAdded"
                @click="addToWatchlist(movie)"
                color="red"
                class="action-btn"
                large
              >
                <v-icon left>mdi-plus</v-icon> Watchlist
              </v-btn>
              <v-btn
                v-else
                @click="removeFromWatchList(movie)"
                outlined
                color="red"
                class="action-btn"
                large
              >
                <v-icon left>mdi-check</v-icon> Added
              </v-btn>
            </div>

            <div class="genre-list">
              <span
                class="grey--text text-uppercase caption font-weight-bold d-block mb-2"
                >Genres</span
              >
              <v-chip
                v-for="genre in movie.genres"
                :key="genre.id"
                color="grey darken-3"
                class="mr-2 mb-2 white--text"
                label
                small
              >
                {{ genre.name }}
              </v-chip>
            </div>
          </v-col>
        </v-row>
      </div>
    </section>

    <Cast :cast="credits" v-if="credits && credits.length" />

    <v-container id="player-section" class="py-12 d-flex justify-center">
      <v-card class="tabs-container">
        <v-tabs
          color="red"
          v-model="tab"
          background-color="black"
          centered
          dark
          icons-and-text
        >
          <v-tabs-slider></v-tabs-slider>
          <v-tab href="#tab-1"> Greek subs </v-tab>
          <v-tab href="#tab-2"> Trailer </v-tab>
        </v-tabs>

        <v-tabs-items v-model="tab" class="player-tabs-content">
          <v-tab-item value="tab-1" class="fill-height-item">
            <div v-if="movie" class="inner-player-layout">
              <v-tabs
                v-model="innerTab"
                background-color="transparent"
                centered
                dark
                color="red"
                height="40"
              >
                <v-tab>Source 1</v-tab>
                <v-tab>Source 2</v-tab>
              </v-tabs>

              <v-tabs-items v-model="innerTab" class="inner-content-fill">
                <v-tab-item>
                  <div class="fixed-iframe-wrapper">
                    <iframe
                      :src="
                        'https://coverapi.space/embed/tv?imdb=' +
                        imdb_id +
                        '&ds_lang=el'
                      "
                      allowfullscreen
                      class="full-iframe"
                    ></iframe>
                  </div>
                </v-tab-item>
                <v-tab-item>
                  <div class="fixed-iframe-wrapper">
                    <iframe
                      :src="'https://coverapi.store/embed/' + imdb_id"
                      allowfullscreen
                      class="full-iframe"
                    ></iframe>
                  </div>
                </v-tab-item>
              </v-tabs-items>
            </div>
          </v-tab-item>

          <v-tab-item value="tab-2" class="fill-height-item">
            <div class="fixed-iframe-wrapper">
              <iframe
                v-if="trailerKey"
                :src="'https://www.youtube.com/embed/' + trailerKey"
                frameborder="0"
                allowfullscreen
                class="full-iframe"
              ></iframe>
              <div
                v-else
                class="d-flex align-center justify-center fill-height white--text"
              >
                Trailer not available.
              </div>
            </div>
          </v-tab-item>
        </v-tabs-items>
      </v-card>
    </v-container>

    <v-container v-if="similarMovies.length" class="similar-section pb-12">
      <h2 class="text-h4 white--text mb-8 px-4 text-center font-weight-bold">
        More Like This
      </h2>
      <v-row class="px-2">
        <v-col
          v-for="similar in similarMovies"
          :key="similar.id"
          cols="6"
          sm="4"
          md="3"
          lg="2"
          class="pa-3"
        >
          <v-card
            class="similar-card elevation-0"
            @click="handleClick(similar)"
          >
            <v-img
              :src="
                similar.poster_path
                  ? 'https://image.tmdb.org/t/p/w342' + similar.poster_path
                  : 'https://via.placeholder.com/342x513?text=No+Image'
              "
              class="rounded-lg mb-2"
              aspect-ratio="0.67"
            >
              <template v-slot:placeholder>
                <v-row class="fill-height ma-0" align="center" justify="center">
                  <v-progress-circular
                    indeterminate
                    color="red darken-2"
                  ></v-progress-circular>
                </v-row>
              </template>
            </v-img>
            <div
              class="white--text text-center text-truncate body-2 font-weight-medium px-1"
            >
              {{ similar.name }}
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
    <AppFooter />
  </div>
</template>

<script>
import Cast from "../components/cast.vue";
import AppFooter from "../components/AppFooter.vue";

const API_CONFIG = {
  baseUrl: "https://api.themoviedb.org/3/tv/",
  headers: {
    accept: "application/json",
    Authorization:
      "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwYjE5NTM3NWNkODk0ZGRlNzkwOGNiNzIxMmQwMTBmOCIsInN1YiI6IjY1ODdmNjU1MmRmZmQ4NWNkYjQ0ZDkwNiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.XaBBhvFBh29o9x62S5G3BJ-KVofB-_clblrCU7PUj7M",
  },
};

export default {
  name: "single-series",
  components: { Cast, AppFooter },
  data() {
    return {
      isMobile: false,
      movie: null,
      imdb_id: null,
      similarMovies: [],
      credits: [],
      trailerKey: null,
      tab: "tab-1",
      innerTab: 0,
      isAdded: false,
    };
  },
  async created() {
    this.isMobile = this.$vuetify.breakpoint.smAndDown;
    const id = this.$route.query.id || this.getCookie("id");
    if (id) {
      this.setCookie("id", id, 1);
      await this.loadAllData(id);
    }
  },
  methods: {
    async loadAllData(id) {
      try {
        const [movieData, similarData, creditsData, idsData, videosData] =
          await Promise.all([
            this.fetchTmdbData(`${id}`),
            this.fetchTmdbData(`${id}/recommendations`),
            this.fetchTmdbData(`${id}/credits`),
            this.fetchTmdbData(`${id}/external_ids`),
            this.fetchTmdbData(`${id}/videos`),
          ]);

        this.movie = movieData;
        // Limit to 18 items for the grid
        this.similarMovies = similarData?.results?.slice(0, 18) || [];
        this.credits = creditsData?.cast || [];
        this.imdb_id = idsData?.imdb_id;

        const trailer = videosData?.results?.find(
          (v) => v.site === "YouTube" && v.type === "Trailer"
        );
        this.trailerKey = trailer ? trailer.key : null;

        this.addToHistory(this.movie);
        this.checkIfMovieIsAdded();
      } catch (error) {
        console.error("Error loading series data:", error);
      }
    },

    async fetchTmdbData(endpoint) {
      const res = await fetch(`${API_CONFIG.baseUrl}${endpoint}`, {
        headers: API_CONFIG.headers,
      });
      return res.json();
    },

    checkIfMovieIsAdded() {
      const watchlist = JSON.parse(localStorage.getItem("watchlist") || "[]");
      this.isAdded = watchlist.some((item) => item.id === this.movie.id);
    },

    addToWatchlist(movie) {
      let watchlist = JSON.parse(localStorage.getItem("watchlist") || "[]");
      if (!watchlist.some((m) => m.id === movie.id)) {
        watchlist.unshift({ ...movie, isSerie: "tv" });
        localStorage.setItem("watchlist", JSON.stringify(watchlist));
        this.isAdded = true;
      }
    },

    removeFromWatchList(movie) {
      let watchlist = JSON.parse(localStorage.getItem("watchlist") || "[]");
      watchlist = watchlist.filter((m) => m.id !== movie.id);
      localStorage.setItem("watchlist", JSON.stringify(watchlist));
      this.isAdded = false;
    },

    addToHistory() {
      if (!this.movie) return;

      let history = JSON.parse(localStorage.getItem("history") || "[]");

      history = history.filter((m) => m.id !== this.movie.id);

      history.push({ ...this.movie, isSerie: "tv" });

      if (history.length > 20) {
        history = history.slice(0, 20);
      }

      localStorage.setItem("history", JSON.stringify(history));
    },

    handleClick(item) {
      this.setCookie("id", item.id, 1);
      this.$router.push({ query: { id: item.id } });
      this.loadAllData(item.id);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },

    setCookie(name, value, days) {
      const date = new Date();
      date.setTime(date.getTime() + days * 864e5);
      document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/`;
    },

    getCookie(name) {
      return document.cookie
        .split("; ")
        .find((row) => row.startsWith(`${name}=`))
        ?.split("=")[1];
    },
  },
};
</script>

<style scoped>
/* HERO STYLES */
.hero-container {
  position: relative;
  height: 100vh;
  display: flex;
  align-items: center;
  overflow: hidden;
}
.movie-banner {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}
.banner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
      to right,
      rgba(0, 0, 0, 0.9) 20%,
      rgba(0, 0, 0, 0.4) 50%,
      rgba(0, 0, 0, 0.9) 80%
    ),
    linear-gradient(
      to top,
      rgba(0, 0, 0, 1) 5%,
      transparent 50%,
      rgba(0, 0, 0, 1) 95%
    );
}
.content-wrapper {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
}
.movie-poster-img {
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 0 30px rgba(255, 0, 0, 0.2);
}
.movie-title-text {
  font-size: clamp(2.5rem, 5vw, 4.5rem);
  font-weight: 900;
  color: white;
  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}
.movie-description {
  color: #ccc;
  max-width: 600px;
  line-height: 1.6;
  font-size: 1.1rem;
}
.rating-badge {
  background: rgba(255, 255, 255, 0.1);
  padding: 4px 12px;
  border-radius: 20px;
  color: white;
  backdrop-filter: blur(5px);
}
.action-btn-main {
  text-transform: none;
  font-weight: bold;
  letter-spacing: 1px;
}
.action-btn {
  font-weight: bold;
  text-transform: none;
  border-radius: 8px;
}

/* PLAYER CONTAINER (FIXED 1000px) */
.tabs-container {
  max-width: 1200px;
  width: 95%;
  margin: 2rem auto;
  border-radius: 16px;
  overflow: hidden;
  height: 1000px;
  display: flex;
  flex-direction: column;
  background-color: black !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.8);
}

.tabs-container ::v-deep .v-window,
.tabs-container ::v-deep .v-window__container,
.tabs-container ::v-deep .v-window-item {
  height: 100% !important;
}

.player-tabs-content {
  flex-grow: 1;
  background-color: black !important;
}
.fill-height-item {
  height: 100%;
}
.inner-player-layout {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.inner-content-fill {
  flex-grow: 1;
  height: 100%;
  background-color: black !important;
}
.fixed-iframe-wrapper {
  width: 100%;
  height: 100%;
  background: black;
}
.full-iframe {
  width: 100%;
  height: 100%;
  border: none;
  display: block;
}

/* MORE LIKE THIS SECTION */
.similar-section {
  background: linear-gradient(to top, #000, #0a0a0a);
  padding-top: 50px;
  max-width: 1600px;
}
.similar-card {
  background: transparent !important;
  cursor: pointer;
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.similar-card:hover {
  transform: scale(1.05);
}
.similar-card:hover .v-image {
  box-shadow: 0 10px 25px rgba(255, 0, 0, 0.3);
}

@media (max-width: 1000px) {
  .tabs-container {
    height: 500px;
  }
  .hero-container {
    height: auto;
    padding-top: 80px;
    padding-bottom: 40px;
  }
  .movie-banner {
    opacity: 0.5;
  }
}
</style>
