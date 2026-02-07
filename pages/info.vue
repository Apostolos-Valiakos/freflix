<template>
  <div style="background-color: black; min-height: 100vh">
    <section v-if="movie" class="hero-container">
      <v-img
        :src="'https://image.tmdb.org/t/p/original' + movie.poster_path"
        alt="Movie Poster"
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
                {{ movie.vote_average.toFixed(1) }}
              </span>
              <span class="mx-3 grey--text">|</span>
              <span class="white--text">{{
                movie.release_date ? movie.release_date.substring(0, 4) : ""
              }}</span>
              <span class="mx-3 grey--text">|</span>
              <span class="white--text">{{ movie.runtime }} min</span>
            </div>

            <h1 class="movie-title-text mb-4">{{ movie.title }}</h1>

            <p class="movie-description mb-6">{{ movie.overview }}</p>

            <div class="d-flex flex-wrap gap-4 mb-8">
              <v-btn
                v-if="isMobile && !isAdded"
                @click="addToWatchlist(movie)"
                color="red"
                class="action-btn"
                large
              >
                <v-icon left>mdi-plus</v-icon> Add to Watchlist
              </v-btn>
              <v-btn
                v-if="isMobile && isAdded"
                @click="removeFromWatchList(movie)"
                outlined
                color="red"
                class="action-btn"
                large
              >
                <v-icon left>mdi-check</v-icon> In Watchlist
              </v-btn>

              <v-btn
                color="white"
                class="action-btn black--text"
                large
                @click="scrollToPlayer"
              >
                <v-icon left color="black">mdi-play</v-icon> Watch Now
              </v-btn>
            </div>

            <div class="genre-list">
              <span
                class="grey--text text-uppercase caption font-weight-bold d-block mb-2"
              >
                Genres
              </span>
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
    <v-container
      id="player-section"
      class="py-12 d-flex justify-center"
      v-if="movie"
    >
      <div class="tabs-container">
        <v-tabs
          v-model="tab"
          color="red"
          background-color="black"
          centered
          dark
          icons-and-text
        >
          <v-tab href="#tab-1"> Greek subs </v-tab>
          <v-tab href="#tab-2"> No subs </v-tab>
          <v-tab href="#tab-3"> Trailer </v-tab>
        </v-tabs>

        <v-tabs-items v-model="tab" class="player-tabs-content">
          <v-tab-item value="tab-1">
            <v-tabs
              v-model="innerTab"
              background-color="transparent"
              centered
              dark
              color="red"
              dense
            >
              <v-tab>Source 1</v-tab>
              <v-tab>Source 2</v-tab>
            </v-tabs>
            <v-tabs-items v-model="innerTab" class="black-bg">
              <v-tab-item
                v-for="(src, index) in [
                  'https://coverapi.store/embed/' + movie.imdb_id,
                  'https://coverapi.space/embed/movie?imdb=' +
                    movie.imdb_id +
                    '&ds_lang=el',
                ]"
                :key="index"
              >
                <div class="iframe-container-wrapper">
                  <iframe
                    :src="src"
                    frameborder="0"
                    allowfullscreen
                    scrolling="no"
                    class="responsive-iframe"
                  ></iframe>
                </div>
              </v-tab-item>
            </v-tabs-items>
          </v-tab-item>

          <v-tab-item value="tab-2">
            <div
              class="d-flex align-center justify-center bg-black"
              style="min-height: 400px"
            >
              <v-btn color="red" dark large @click="watchMovie(movie.imdb_id)"
                >Watch in external player</v-btn
              >
            </div>
          </v-tab-item>

          <v-tab-item value="tab-3">
            <div class="iframe-container-wrapper">
              <iframe
                v-if="trailerKey"
                :src="'https://www.youtube.com/embed/' + trailerKey"
                frameborder="0"
                allowfullscreen
                class="responsive-iframe"
              ></iframe>
            </div>
          </v-tab-item>
        </v-tabs-items>
      </div>
    </v-container>

    <v-container v-if="combinedSimilar.length" class="similar-section pb-12">
      <h2 class="text-h4 white--text mb-6 px-4">More Like This</h2>
      <v-row class="px-2">
        <v-col
          v-for="similar in combinedSimilar"
          :key="similar.id"
          cols="6"
          sm="4"
          md="2"
        >
          <v-card class="similar-card" @click="goToMovie(similar.id)">
            <v-img
              :src="
                similar.poster_path
                  ? 'https://image.tmdb.org/t/p/w342' + similar.poster_path
                  : 'https://via.placeholder.com/342x513?text=No+Image'
              "
              class="rounded-lg"
              aspect-ratio="0.66"
            />
            <div class="pa-2 white--text text-truncate subtitle-2">
              {{ similar.title }}
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

export default {
  components: { Cast, AppFooter },
  data() {
    return {
      movie: null,
      credits: [],
      combinedSimilar: [],
      isAdded: false,
      tab: "tab-1",
      innerTab: 0,
      trailerKey: null,
    };
  },
  computed: {
    isMobile() {
      return this.$vuetify.breakpoint.smAndDown;
    },
  },
  watch: {
    "$route.query.id": {
      handler: "loadAllData",
      immediate: true,
    },
  },
  methods: {
    async loadAllData() {
      const id = this.$route.query.id;
      if (!id) return;

      // Reset UI state for new movie
      this.movie = null;
      this.tab = "tab-1";
      this.innerTab = 0;
      if (!id) return;

      const options = {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization:
            "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwYjE5NTM3NWNkODk0ZGRlNzkwOGNiNzIxMmQwMTBmOCIsInN1YiI6IjY1ODdmNjU1MmRmZmQ4NWNkYjQ0ZDkwNiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.XaBBhvFBh29o9x62S5G3BJ-KVofB-_clblrCU7PUj7M",
        },
      };

      try {
        // 1. Fetch Movie Details
        const movieRes = await fetch(
          `https://api.themoviedb.org/3/movie/${id}?language=en-US`,
          options
        );
        this.movie = await movieRes.json();

        // 2. Fetch Cast
        const creditsRes = await fetch(
          `https://api.themoviedb.org/3/movie/${id}/credits?language=en-US`,
          options
        );
        const creditsData = await creditsRes.json();
        this.credits = creditsData.cast || [];

        // 3. Fetch Trailer
        const videosRes = await fetch(
          `https://api.themoviedb.org/3/movie/${id}/videos?language=en-US`,
          options
        );
        const videosData = await videosRes.json();
        const trailer = videosData.results.find(
          (v) => v.type === "Trailer" && v.site === "YouTube"
        );
        this.trailerKey = trailer ? trailer.key : null;

        // 4. Handle Collection & Similar (Combine for 18 items)
        let collectionResults = [];
        if (this.movie.belongs_to_collection) {
          const collRes = await fetch(
            `https://api.themoviedb.org/3/collection/${this.movie.belongs_to_collection.id}?language=en-US`,
            options
          );
          const collData = await collRes.json();
          collectionResults = (collData.parts || []).filter(
            (p) => p.id !== this.movie.id
          );
        }

        const similarRes = await fetch(
          `https://api.themoviedb.org/3/movie/${id}/similar?language=en-US&page=1`,
          options
        );
        const similarData = await similarRes.json();
        const similarResults = similarData.results || [];

        // Merge: Collection first, then Similar. Filter duplicates and current movie.
        const merged = [...collectionResults, ...similarResults];
        const unique = [];
        const seen = new Set();
        seen.add(Number(id));

        for (const item of merged) {
          if (!seen.has(item.id)) {
            seen.add(item.id);
            unique.push(item);
          }
        }
        this.combinedSimilar = unique.slice(0, 18);

        this.checkWatchlist();
        this.saveToHistory();
      } catch (err) {
        console.error("Error loading movie details:", err);
      }
    },

    checkWatchlist() {
      const watchlist = JSON.parse(localStorage.getItem("watchlist") || "[]");
      this.isAdded = watchlist.some((m) => m.id === this.movie.id);
    },

    addToWatchlist(movie) {
      let watchlist = JSON.parse(localStorage.getItem("watchlist") || "[]");
      if (!watchlist.some((m) => m.id === movie.id)) {
        watchlist.push({ ...movie, isSerie: "movie" });
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

    saveToHistory() {
      let history = JSON.parse(localStorage.getItem("history") || "[]");
      const exists = history.find((m) => m.id === this.movie.id);
      if (!exists) {
        history.unshift({ ...this.movie, isSerie: "movie" });
        if (history.length > 20) history.pop();
        localStorage.setItem("history", JSON.stringify(history));
      }
    },

    watchMovie(imdbId) {
      window.open(`https://vidsrc.to/embed/movie/${imdbId}`, "_blank");
    },

    goToMovie(id) {
      this.$router.push({ query: { id } });
      window.scrollTo({ top: 0, behavior: "smooth" });
    },

    scrollToPlayer() {
      const el = document.getElementById("player-section");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    },
  },
};
</script>

<style scoped>
.hero-container {
  position: relative;
  height: 100vh;
  width: 100%;
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

.rating-badge {
  background: rgba(255, 255, 255, 0.1);
  padding: 4px 12px;
  border-radius: 20px;
  font-weight: bold;
  color: white;
  backdrop-filter: blur(5px);
}

.movie-title-text {
  font-size: clamp(2.5rem, 5vw, 4.5rem);
  line-height: 1.1;
  font-weight: 900;
  color: white;
  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}

.movie-description {
  font-size: 1.1rem;
  color: #ccc;
  max-width: 600px;
  line-height: 1.6;
}

.action-btn {
  font-weight: bold;
  text-transform: none;
  letter-spacing: 0.5px;
  border-radius: 8px;
}

.action-btn-main {
  text-transform: none;
  font-weight: bold;
  letter-spacing: 1px;
}

.gap-4 {
  gap: 16px;
}

/* 4. The iframe itself */
.full-iframe {
  width: 100%;
  height: 100%;
  border: none;
  display: block;
}
.black-bg {
  background-color: black !important;
}
/* Target the specific wrapper for your iframes */
.iframe-container-wrapper {
  position: relative;
  width: 100%;
  padding-bottom: 56.25%; /* 16:9 Aspect Ratio */
  height: 0;
  overflow: hidden; /* This hides the scrollbar */
}

/* Ensure the iframe itself doesn't trigger scrollbars */
.responsive-iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
  overflow: hidden;
}
.inner-tab-btn {
  text-transform: none !important;
  font-size: 0.8rem !important;
}
.watch-btn {
  text-transform: none;
  font-weight: bold;
  padding: 1.5rem 2rem !important;
  font-size: 1.1rem;
}

/* Similar Section Styles */
.similar-section {
  background: linear-gradient(to top, #000, #111);
}
.similar-card {
  background: transparent !important;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.similar-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 10px 20px rgba(255, 0, 0, 0.2);
}

@media (max-width: 960px) {
  .hero-container {
    height: auto;
    padding-top: 80px;
    padding-bottom: 40px;
  }
  .movie-banner {
    opacity: 0.5;
  }
}

/* Force Vuetify's internal containers to take the full remaining height */
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

/* Iframe Wrapper for Fixed Height */
.fixed-iframe-wrapper {
  width: 100%;
  height: 100%;
  background: black;
}

.full-iframe {
  width: 100%;
  height: 100%;
  border: none;
}

.bg-black {
  background-color: black;
}

/* Responsiveness: Adjust height for smaller screens so it doesn't overflow */
@media (max-width: 1000px) {
  .tabs-container {
    height: 350px; /* Smaller fixed height for mobile */
  }
}
.tabs-container {
  width: 100%;
  max-width: 1100px;
  background-color: black;
  border-radius: 12px;
  overflow: hidden;
}

.iframe-container-wrapper {
  position: relative;
  width: 100%;
  padding-bottom: 56.25%; /* Perfect 16:9 ratio */
  height: 0;
  background: #000;
  overflow: hidden;
}

.responsive-iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 0;
}
</style>
