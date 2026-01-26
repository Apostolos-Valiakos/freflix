<template>
  <div>
    <section v-if="movie" style="height: 100vh">
      <v-img
        :src="'https://image.tmdb.org/t/p/original' + movie.poster_path"
        alt="Movie Poster"
        class="movie-banner"
      />
      <div style="z-index: 1">
        <v-row>
          <v-col v-if="!isMobile">
            <figure>
              <v-row
                style="
                  justify-content: center;
                  align-content: center;
                  display: flex;
                  margin-top: 20vh;
                "
              >
                <v-img
                  max-width="250"
                  style="display: flex; justify-content: center"
                  :src="`https://image.tmdb.org/t/p/w500/${movie.poster_path}`"
                  alt="Poster Image"
                  class="movie-poster"
                />
              </v-row>
              <v-row style="justify-content: center; padding-top: 1em">
                <v-btn
                  v-if="!isAdded"
                  @click="addToWatchlist(movie)"
                  style="color: white"
                  color="red"
                  :disabled="isAdded"
                  class="watchlist-btn"
                >
                  Add to watchlist
                </v-btn>
                <v-btn
                  v-if="isAdded"
                  @click="removeFromWatchList(movie)"
                  style="color: red"
                  color="white"
                  class="watchlist-btn remove"
                >
                  Remove from watchlist
                </v-btn>
              </v-row>
            </figure>
          </v-col>
          <v-col style="margin-top: 20vh">
            <div style="position: relative; z-index: 2">
              <p class="popularity-text">
                ⭐ Rating: {{ movie.vote_average }} out of
                {{ movie.vote_count }} votes on IMDB
              </p>
              <h2 class="movie-title">{{ movie.name }}</h2>
              <h3 class="movie-meta">
                Last air date: {{ movie.last_air_date }}
              </h3>
              <p class="movie-overview">{{ movie.overview }}</p>
              <br />
              <div class="my-3 text-center" v-if="isMobile">
                <v-btn
                  v-if="!isAdded"
                  @click="addToWatchlist(movie)"
                  style="color: white"
                  color="red"
                  :disabled="isAdded"
                  class="watchlist-btn"
                >
                  Add to watchlist
                </v-btn>
                <v-btn
                  v-if="isAdded"
                  @click="removeFromWatchList(movie)"
                  style="color: red"
                  color="white"
                  class="watchlist-btn remove"
                >
                  Remove from watchlist
                </v-btn>
              </div>
              <h3 class="episode-title">
                Last Episode to air:
                <v-chip color="red" class="episode-chip">
                  {{ movie.last_episode_to_air.name }}
                </v-chip>
              </h3>
              <p class="genre">Genre:</p>

              <div
                class="in-row"
                style="display: flex; flex-direction: row; flex-wrap: nowrap"
              >
                <div v-for="genre in movie.genres" :key="genre.id">
                  <p>
                    <v-chip class="mx-1 genre-chip" color="red">
                      {{ genre.name }}
                    </v-chip>
                  </p>
                </div>
              </div>
            </div>
          </v-col>
        </v-row>
      </div>
    </section>
    <Cast :cast="credits" v-if="credits != []" />
    <div>
      <v-card class="tabs-container">
        <template>
          <v-card>
            <v-tabs
              color="red"
              v-model="tab"
              background-color="black"
              centered
              dark
              icons-and-text
              class="movie-tabs"
            >
              <v-tabs-slider></v-tabs-slider>

              <v-tab href="#tab-1"> Greek subs </v-tab>
              <v-tab href="#tab-2"> Trailer </v-tab>
            </v-tabs>

            <v-tabs-items v-model="tab" class="black-bg">
              <v-tab-item value="tab-1">
                <v-card flat color="black">
                  <div v-if="movie" class="pt-4">
                    <v-tabs
                      v-model="innerTab"
                      background-color="transparent"
                      centered
                      dark
                      color="red"
                      slider-color="red"
                      class="inner-tabs mb-6"
                      height="40"
                    >
                      <v-tab key="source-1" class="inner-tab-btn">
                        <v-icon left small>mdi-server-network</v-icon> Source 1
                      </v-tab>
                      <v-tab key="source-2" class="inner-tab-btn">
                        <v-icon left small>mdi-server-network</v-icon> Source 2
                      </v-tab>
                    </v-tabs>

                    <v-tabs-items
                      v-model="innerTab"
                      style="background-color: black"
                    >
                      <v-tab-item key="source-1">
                        <v-card flat color="black">
                          <div class="iframe-container-wrapper">
                            <iframe
                              sandbox="allow-forms allow-pointer-lock allow-same-origin allow-scripts allow-top-navigation"
                              :src="'https://coverapi.store/embed/' + imdb_id"
                              frameBorder="0"
                              allowfullscreen
                              class="embed-iframe responsive-iframe"
                              :key="imdb_id + '-2'"
                            ></iframe>
                          </div>
                        </v-card>
                      </v-tab-item>
                      <v-tab-item key="source-2">
                        <v-card flat color="black">
                          <div class="iframe-container-wrapper">
                            <iframe
                              sandbox="allow-forms allow-pointer-lock allow-same-origin allow-scripts allow-top-navigation"
                              :src="
                                'https://coverapi.space/embed/tv?imdb=' +
                                imdb_id +
                                '&ds_lang=el'
                              "
                              frameBorder="0"
                              allowfullscreen
                              class="embed-iframe responsive-iframe"
                              :key="imdb_id + '-1'"
                            ></iframe>
                          </div>
                        </v-card>
                      </v-tab-item>
                    </v-tabs-items>
                  </div>
                </v-card>
              </v-tab-item>

              <v-tab-item value="tab-2">
                <v-card color="black">
                  <div
                    v-if="movie"
                    class="iframe-container-wrapper pt-5 pb-5"
                    style="background-color: black"
                  >
                    <iframe
                      :src="'https://www.youtube.com/embed/' + trailerKey"
                      frameborder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerpolicy="strict-origin-when-cross-origin"
                      allowfullscreen
                      class="embed-iframe responsive-iframe"
                    ></iframe>
                  </div>
                </v-card>
              </v-tab-item>
            </v-tabs-items>
          </v-card>
        </template>
      </v-card>
    </div>

    <div
      style="display: flex; justify-content: center; text-align: center"
      class="similar-section"
    >
      <v-sheet
        class="d-flex align-content-center flex-wrap bg-surface-variant similar-sheet"
        style="
          background-color: black;
          text-align: center;
          justify-content: center;
        "
      >
        <div
          v-for="(item, index) in similarMovies"
          :key="index"
          class="similar-item"
        >
          <v-card
            class="pa-2 similar-card"
            @click="handleClick(item)"
            style="background-color: black"
            v-if="item !== undefined && item.poster_path"
            width="200"
            height="300"
          >
            <a :href="'/infoSeries/?id=' + item.id">
              <v-img
                contain
                class="mt-2 movie-poster similar-poster"
                :src="'https://image.tmdb.org/t/p//w500' + item.poster_path"
                max-width="200"
                max-height="200"
              />
            </a>
            <v-card-text
              style="
                text-align: center;
                justify-content: center;
                display: flex;
                color: white;
                text-wrap: auto;
              "
              class="similar-title"
            >
              {{ item.name }}
            </v-card-text>
          </v-card>
        </div>
      </v-sheet>
    </div>
  </div>
</template>

<script>
// API Configuration Constants
const API_CONFIG = {
  baseUrl: "https://api.themoviedb.org/3/tv/",
  headers: {
    accept: "application/json",
    Authorization:
      "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwYjE5NTM3NWNkODk0ZGRlNzkwOGNiNzIxMmQwMTBmOCIsInN1YiI6IjY1ODdmNjU1MmRmZmQ4NWNkYjQ0ZDkwNiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.XaBBhvFBh29o9x62S5G3BJ-KVofB-_clblrCU7PUj7M",
  },
};

export default {
  name: "single-movie",
  data() {
    return {
      isMobile: false,
      selectedSeason: 1,
      details: [],
      isAdded: false,
      season: 1,
      episode: 1,
      episodes: [],
      selectedSeriesInfo: null,
      query: null,
      popup: false,
      movie: null,
      imdb_id: null,
      similarMovies: [],
      credits: [],
      trailerKey: null,
      tab: null,
      innerTab: null,
    };
  },
  async created() {
    this.isMobile = screen.width < 450;
    this.query = this.$route.query.id || this.getCookie("id");

    if (this.$route.query.id) {
      this.setCookie("id", this.query, 1);
    }

    await this.getTopMovie(this.query);

    // Parallelize API calls
    await Promise.all([
      this.getSimilarMovies(this.query),
      this.getDetails(this.query),
      this.getIMDBID(this.query),
      this.getCredits(this.query),
      this.getTrailer(this.query),
    ]);

    this.checkIfMovieIsAdded();
  },
  methods: {
    // Generic API fetch helper
    async fetchTmdbData(endpoint, params = "") {
      try {
        const response = await fetch(
          `${API_CONFIG.baseUrl}${endpoint}${params}`,
          {
            method: "GET",
            headers: API_CONFIG.headers,
          }
        );
        return await response.json();
      } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
        return null;
      }
    },

    // LocalStorage helpers
    getLocalStorageArray(key) {
      return JSON.parse(localStorage.getItem(key) || "[]");
    },

    setLocalStorageArray(key, array) {
      localStorage.setItem(key, JSON.stringify(array));
    },

    // List management helper
    updateLocalStorageList(key, movie, addToStart = false) {
      const list = this.getLocalStorageArray(key);
      const index = list.findIndex(
        (item) => item.id === movie.id && item.isSerie === movie.isSerie
      );

      if (index > -1) {
        list.splice(index, 1);
      }

      if (addToStart) {
        list.unshift(movie);
      } else {
        list.push(movie);
      }

      this.setLocalStorageArray(key, list);
      return index === -1; // returns true if item was added, false if it was moved
    },

    // Movie data methods
    async getTopMovie(id) {
      const data = await this.fetchTmdbData(
        `${id}?api_key=5b75818e63dfdb396cadedf77425b334&language=en-US&page=1`
      );
      if (data) {
        this.movie = data;
        this.addToHistory(this.movie);
      }
    },

    async getSimilarMovies(id) {
      const data = await this.fetchTmdbData(
        `${id}/recommendations?language=en-US&page=1`
      );
      if (data) {
        this.similarMovies = data.results.slice(1);
      }
    },

    async getDetails(id) {
      const data = await this.fetchTmdbData(`${id}?language=en-US`);
      if (data) {
        this.details = data.seasons.map((element) => ({
          season: element.name,
        }));
        this.selectedSeriesInfo = data;
      }
    },

    async getIMDBID(id) {
      const data = await this.fetchTmdbData(`${id}/external_ids`);
      if (data) {
        this.imdb_id = data.imdb_id;
      }
    },

    async getCredits(id) {
      const data = await this.fetchTmdbData(`${id}/credits?language=en-US`);
      if (data) {
        this.credits = data.cast;
      }
    },

    async getTrailer(id) {
      const data = await this.fetchTmdbData(`${id}/videos?language=en-US`);
      if (data) {
        const trailer = data.results.find(
          (element) => element.site === "YouTube" && element.type === "Trailer"
        );
        if (trailer) this.trailerKey = trailer.key;
      }
    },

    // Watchlist/history methods
    checkIfMovieIsAdded() {
      this.isAdded = this.movieExistsInArray(
        this.movie,
        this.getLocalStorageArray("watchlist")
      );
    },

    movieExistsInArray(movie, array) {
      return array.some(
        (item) => item.id === movie.id && item.isSerie === movie.isSerie
      );
    },

    addToHistory(movie) {
      movie.isSerie = "tv";
      this.isAdded = this.updateLocalStorageList("history", movie);
    },

    addToWatchlist(movie) {
      movie.isSerie = "tv";
      this.isAdded = this.updateLocalStorageList("watchlist", movie, true);
    },

    removeFromWatchList(movie) {
      const watchlist = this.getLocalStorageArray("watchlist");
      const index = watchlist.findIndex((item) => item.id === movie.id);
      if (index > -1) {
        watchlist.splice(index, 1);
        this.setLocalStorageArray("watchlist", watchlist);
        this.isAdded = false;
      }
    },

    // Cookie helpers
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

    eraseCookie(name) {
      document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
    },

    // Navigation methods
    watchMovie(id) {
      location.href = `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${this.season}&e=${this.episode}`;
    },

    handleClick(item) {
      this.getTopMovie(item.id);
      Promise.all([
        this.getSimilarMovies(item.id),
        this.getDetails(item.id),
        this.getCredits(item.id),
        this.getIMDBID(item.id),
        this.getTrailer(item.id),
      ]);
      this.eraseCookie("id");
      this.setCookie("id", item.id, 1);
    },
  },
};
</script>

<style scoped>
h1,
p {
  padding: 0;
  margin: 0;
}

section:first-child {
  object-fit: cover;
  position: relative;
  overflow: hidden;
}

section:first-child::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  height: 0;
  padding-bottom: calc(33.5% - 92px + 30px);
  width: 100%;
  background-image: linear-gradient(
    transparent,
    rgba(25, 26, 26, 0.3) 5%,
    rgba(25, 26, 26, 0.5) 15%,
    rgba(25, 26, 26, 0.7) 30%,
    rgba(25, 26, 26, 0.9) 70%,
    #000000
  );
  z-index: -1;
  animation: gradientShift 10s ease-in-out infinite alternate;
}

@keyframes gradientShift {
  0% {
    opacity: 0.8;
  }
  100% {
    opacity: 1;
  }
}

section:nth-child(2) {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: -10em;
  position: relative;
}

.popularity-text {
  padding-bottom: 0.3em;
  color: #ffd700;
  font-weight: bold;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  font-size: 1.1rem;
}

.movie-title {
  padding: 0;
  margin: 0;
  max-width: 15em;
  font-size: 2.5rem;
  background: linear-gradient(45deg, #ff0000, #ff4500);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  font-weight: bold;
}

.movie-meta {
  color: #e5e5e5;
  font-size: 1.2rem;
  margin: 0.2em 0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.episode-title {
  color: #ff0000;
  font-weight: bold;
  font-size: 1.1rem;
  margin: 1em 0;
}

.episode-chip {
  margin-left: 0.5rem;
  border: 2px solid #ff0000;
  transition: all 0.3s ease;
}

.episode-chip:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 8px rgba(255, 0, 0, 0.3);
}

.movie-overview {
  color: #f0f0f0;
  line-height: 1.6;
  font-size: 1.1rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  max-width: 30em;
}

.genre {
  padding-top: 1em;
  color: #ff0000;
  font-weight: bold;
  font-size: 1.1rem;
}

.genre-chip {
  border: 2px solid #ff0000;
  transition: all 0.3s ease;
}

.genre-chip:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 8px rgba(255, 0, 0, 0.3);
}

.movie-banner {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  position: absolute;
  left: 0;
  z-index: 0;
  opacity: 0.7;
  filter: brightness(0.8);
  transition: filter 0.3s ease;
}

.movie-poster {
  width: 15em;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.movie-poster:hover {
  transform: scale(1.05);
  box-shadow: 0 12px 40px rgba(255, 0, 0, 0.4);
}

.watchlist-btn {
  border-radius: 25px;
  padding: 0 2rem;
  font-weight: bold;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  text-transform: none;
}

.watchlist-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 0, 0, 0.4);
}

.watchlist-btn.remove {
  border: 2px solid #ff0000;
}

.watchlist-btn.remove:hover {
  background-color: #ff0000;
  color: white !important;
}

/* Tabs styling */
.tabs-container {
  margin: 2rem 0;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
}

.movie-tabs .v-tab {
  font-weight: bold;
  text-transform: none;
  transition: color 0.3s ease;
}

.movie-tabs .v-tab--active {
  color: #ff0000 !important;
}

.black-bg {
  background-color: black !important;
}

/* Inner Nested Tabs Styling */
.inner-tabs {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.inner-tab-btn {
  font-size: 0.9rem;
  opacity: 0.7;
}

.inner-tab-btn.v-tab--active {
  opacity: 1;
}

/* Iframe Container Styling */
.iframe-container-wrapper {
  display: flex;
  justify-content: center;
  text-align: center;
  background-color: black;
  width: 100%;
}

.responsive-iframe {
  width: 800px;
  height: 600px;
  max-width: 100%;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
  transition: transform 0.3s ease;
  background-color: black;
}

.embed-iframe {
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
  transition: transform 0.3s ease;
}

.similar-section {
  margin: 3rem 0;
  padding: 2rem;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.8),
    rgba(0, 0, 0, 0.9)
  );
  border-radius: 16px;
}

.similar-sheet {
  gap: 1.5rem;
  padding: 1rem;
}

.similar-item {
  transition: transform 0.3s ease;
}

.similar-card {
  border-radius: 12px;
  transition: all 0.3s ease;
  cursor: pointer;
  overflow: hidden;
}

.similar-card:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 12px 40px rgba(255, 0, 0, 0.3);
}

.similar-poster {
  border-radius: 8px;
  transition: transform 0.3s ease;
}

.similar-poster:hover {
  transform: scale(1.1);
}

.similar-title {
  font-weight: bold;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.movie-grid {
  display: grid;
  grid-template-columns: auto auto auto auto auto;
  padding: 10px;
}

.grid-item {
  padding: 20px;
  text-align: center;
}

@media (max-width: 50em) {
  section:nth-child(2) {
    flex-direction: column;
    padding: 0 1em;
  }

  .movie-title {
    font-size: 2rem;
  }

  .movie-overview {
    font-size: 1rem;
  }

  .movie-poster {
    width: 12em;
  }

  /* Make iframes responsive on mobile */
  .responsive-iframe {
    width: 100%;
    height: 50vh;
  }

  .similar-section {
    padding: 1rem;
  }

  .similar-sheet {
    justify-content: center;
    gap: 1rem;
  }
}
</style>
