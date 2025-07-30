<template>
  <div>
    <section v-if="movie">
      <v-img
        :src="'https://image.tmdb.org/t/p/original' + movie.poster_path"
        alt="Movie Poster"
        class="movie-banner"
      />
      <div style="z-index: 1">
        <v-row>
          <v-col v-if="!isMobile">
            <figure>
              <v-row style="justify-content: center">
                <v-img
                  style="display: flex; justify-content: center"
                  :src="`https://image.tmdb.org/t/p/w500/${movie.poster_path}`"
                  alt="Poster Image"
                  class="movie-poster"
                />
              </v-row>
              <v-row style="justify-content: center">
                <v-btn
                  v-if="!isAdded"
                  @click="addToWatchlist(movie)"
                  style="color: white"
                  color="red"
                  :disabled="isAdded"
                >
                  Add to watchlist
                </v-btn>
                <v-btn
                  v-if="isAdded"
                  @click="removeFromWatchList(movie)"
                  style="color: red"
                  color="white"
                >
                  Remove from watchlist
                </v-btn>
              </v-row>
            </figure>
          </v-col>
          <v-col>
            <p class="popularity-text">
              ⭐ Rating: {{ movie.vote_average }} out of
              {{ movie.vote_count }} votes on IMDB
            </p>
            <h2>{{ movie.title }}</h2>
            <h3>{{ movie.release_date }}</h3>
            <h3>{{ movie.runtime }} mins</h3>
            <p>{{ movie.overview }}</p>
            <v-row style="justify-content: center" class="mt-3" v-if="isMobile">
              <v-btn
                v-if="!isAdded"
                @click="addToWatchlist(movie)"
                style="color: white"
                color="red"
                :disabled="isAdded"
              >
                Add to watchlist
              </v-btn>
              <v-btn
                v-if="isAdded"
                @click="removeFromWatchList(movie)"
                style="color: red"
                color="white"
              >
                Remove from watchlist
              </v-btn>
            </v-row>
            <p class="genre">Genre:</p>
            <div
              class="in-row"
              style="display: flex; flex-direction: row; flex-wrap: nowrap"
            >
              <div v-for="genre in movie.genres" :key="genre.id">
                <p>
                  <v-chip color="red" class="mx-1">{{ genre.name }}</v-chip>
                </p>
              </div>
            </div>
          </v-col>
        </v-row>
      </div>
    </section>
    <Cast :cast="credits" v-if="credits != []" />
    <div>
      <v-card>
        <template>
          <v-card>
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

              <v-tab href="#tab-2"> No subs </v-tab>

              <v-tab href="#tab-3"> Trailer </v-tab>
            </v-tabs>

            <v-tabs-items v-model="tab">
              <v-tab-item value="tab-1">
                <v-card flat>
                  <div
                    v-if="movie"
                    style="
                      display: flex;
                      justify-content: center;
                      text-align: center;
                      background-color: black;
                    "
                  >
                    <iframe
                      sandbox="allow-forms allow-pointer-lock allow-same-origin allow-scripts allow-top-navigation"
                      :src="'https://coverapi.store/embed/' + movie.imdb_id"
                      width="800"
                      height="600"
                      frameBorder="0"
                      allowfullscreen
                    ></iframe>
                  </div>
                </v-card>
              </v-tab-item>
              <v-tab-item value="tab-2">
                <v-card>
                  <div
                    v-if="movie"
                    style="
                      display: flex;
                      justify-content: center;
                      text-align: center;

                      background-color: black;
                    "
                  >
                    <div style="width: 800px; height: 600px">
                      <v-btn
                        class="mt-14"
                        color="red"
                        style="color: white"
                        @click="watchMovie(movie.imdb_id)"
                      >
                        Watch the Movie in an external player
                      </v-btn>
                    </div>
                  </div>
                </v-card>
              </v-tab-item>
              <v-tab-item value="tab-3">
                <v-card>
                  <div
                    v-if="movie"
                    style="
                      display: flex;
                      justify-content: center;
                      text-align: center;
                      background-color: black;
                    "
                  >
                    <div style="width: 800px; height: 600px">
                      <iframe
                        width="800"
                        height="600"
                        :src="'https://www.youtube.com/embed/' + trailerKey"
                        frameborder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerpolicy="strict-origin-when-cross-origin"
                        allowfullscreen
                      ></iframe>
                    </div>
                  </div>
                </v-card>
              </v-tab-item>
            </v-tabs-items>
          </v-card>
        </template>
      </v-card>
    </div>

    <div style="display: flex; justify-content: center; text-align: center">
      <v-sheet
        style="
          background-color: black;
          text-align: center;
          justify-content: center;
        "
        class="d-flex align-content-center flex-wrap bg-surface-variant"
      >
        <div v-for="(item, index) in similarMovies" :key="index">
          <v-card
            class="pa-2"
            @click="ClickOnSimilarMovies(item)"
            v-if="item !== undefined && item.poster_path"
            style="background-color: black"
            width="200"
            height="300"
          >
            <a :href="'/info?id=' + item.id">
              <v-img
                contain
                class="mt-2 movie-poster"
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
              "
            >
              {{ item.title }}
            </v-card-text>
          </v-card>
        </div>
      </v-sheet>
    </div>
  </div>
</template>
<script>
import Cast from "../components/cast.vue";

// Constants
const WATCHLIST_KEY = "watchlist";
const HISTORY_KEY = "history";
const ID_COOKIE = "id";
const BASE_MOVIE_API_URL = "https://api.themoviedb.org/3/movie";
const COMMON_HEADERS = {
  accept: "application/json",
  Authorization:
    "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwYjE5NTM3NWNkODk0ZGRlNzkwOGNiNzIxMmQwMTBmOCIsIm5iZiI6MTcwMzQwOTIzNy42MDE5OTk4LCJzdWIiOiI2NTg3ZjY1NTJkZmZkODVjZGI0NGQ5MDYiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.74U2ndKrTu5lyaGDxrPDGKJNVMjCen72gWPGG75oWcs",
};

export default {
  name: "single-movie",
  data() {
    return {
      tab: null,
      text: "",
      isMobile: false,
      isAdded: false,
      query: null,
      popup: false,
      movie: null,
      similarMovies: [],
      credits: [],
      trailerKey: null,
    };
  },
  async created() {
    this.isMobile = screen.width < 450;
    this.query = this.$route.query.id || this.getCookie(ID_COOKIE);

    if (this.$route.query.id) {
      this.setCookie(ID_COOKIE, this.query, 1);
    }

    await this.loadMovieData(this.query);
  },
  methods: {
    async loadMovieData(id) {
      try {
        await this.getTopMovie(id);
        await Promise.all([
          this.getSimilarMovies(id),
          this.getCredits(this.movie),
          this.getTrailer(this.movie),
        ]);

        this.updateWatchlistStatus();
      } catch (error) {
        console.error("Error loading movie data:", error);
      }
    },

    // LocalStorage helpers
    getLocalStorageArray(key) {
      return JSON.parse(localStorage.getItem(key) || "[]");
    },

    setLocalStorageArray(key, array) {
      localStorage.setItem(key, JSON.stringify(array));
    },

    updateWatchlistStatus() {
      const watchlist = this.getLocalStorageArray(WATCHLIST_KEY);
      this.isAdded = watchlist.some(
        (item) =>
          item.id === this.movie.id && item.isSerie === this.movie.isSerie
      );
    },

    async fetchApiData(url, options) {
      try {
        const response = await fetch(url, options);
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
      } catch (error) {
        console.error(`Error fetching data from ${url}:`, error);
        throw error;
      }
    },

    async getCredits(movie) {
      const url = `${BASE_MOVIE_API_URL}/${movie.id}/credits?language=en-US`;
      const data = await this.fetchApiData(url, {
        method: "GET",
        headers: COMMON_HEADERS,
      });
      this.credits = data.cast;
    },

    async getTopMovie(id) {
      const url = `${BASE_MOVIE_API_URL}/${id}?api_key=5b75818e63dfdb396cadedf77425b334&language=en-US&page=1`;
      this.movie = await this.fetchApiData(url, { method: "GET" });
      this.addToHistory(this.movie);
    },

    async getSimilarMovies(id) {
      const url = `${BASE_MOVIE_API_URL}/${id}/recommendations?language=en-US&page=1`;
      const data = await this.fetchApiData(url, {
        method: "GET",
        headers: COMMON_HEADERS,
      });
      this.similarMovies = data.results.slice(1);
    },

    async getTrailer(movie) {
      const url = `${BASE_MOVIE_API_URL}/${movie.id}/videos?language=en-US`;
      const data = await this.fetchApiData(url, {
        method: "GET",
        headers: COMMON_HEADERS,
      });

      const trailer = data.results.find(
        (element) => element.site === "YouTube" && element.type === "Trailer"
      );
      if (trailer) this.trailerKey = trailer.key;
    },

    manageLocalStorageArray(key, movie, addToStart = false) {
      const array = this.getLocalStorageArray(key);
      const index = array.findIndex(
        (item) => item.id === movie.id && item.isSerie === movie.isSerie
      );

      if (index !== -1) {
        array.splice(index, 1);
      }

      if (addToStart) {
        array.unshift(movie);
      } else {
        array.push(movie);
      }

      this.setLocalStorageArray(key, array);
    },

    addToHistory(movie) {
      movie.isSerie = "movie";
      this.manageLocalStorageArray(HISTORY_KEY, movie);
    },

    addToWatchlist(movie) {
      movie.isSerie = "movie";
      this.manageLocalStorageArray(WATCHLIST_KEY, movie, true);
      this.isAdded = true;
    },

    removeFromWatchList(movie) {
      const watchlist = this.getLocalStorageArray(WATCHLIST_KEY);
      const updatedWatchlist = watchlist.filter(
        (item) => !(item.id === movie.id && item.isSerie === movie.isSerie)
      );
      this.setLocalStorageArray(WATCHLIST_KEY, updatedWatchlist);
      this.isAdded = false;
    },

    watchMovie(id) {
      window.location.href = `https://multiembed.mov/?video_id=${id}`;
    },

    ClickOnSimilarMovies(item) {
      this.eraseCookie(ID_COOKIE);
      this.setCookie(ID_COOKIE, item.id, 1);
      this.loadMovieData(item.id);
    },

    // Cookie helpers
    setCookie(name, value, days) {
      const date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      document.cookie = `${name}=${
        value || ""
      }; expires=${date.toUTCString()}; path=/`;
    },

    getCookie(name) {
      const nameEQ = `${name}=`;
      return (
        document.cookie
          .split(";")
          .map((c) => c.trim())
          .find((c) => c.startsWith(nameEQ))
          ?.substring(nameEQ.length) || null
      );
    },

    eraseCookie(name) {
      document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
    },
  },
  components: { Cast },
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
    rgba(25, 26, 26, 0.4) 10%,
    rgba(25, 26, 26, 0.6) 20%,
    rgba(25, 26, 26, 0.8) 80%,
    var(--dark-grey)
  );
  z-index: -1;
}

section:nth-child(2) {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: -10em;
}

.popularity-text {
  padding-bottom: 0.3em;
}

h2 {
  padding: 0;
  margin: 0;
  max-width: 15em;
  font-size: 2rem;
}

p {
  padding: 0;
  margin: 0;
  max-width: 30em;
  font-size: 1.3rem;
}

.genre {
  padding-top: 1em;
}

.movie-banner {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  position: absolute;
  left: 0;
  z-index: 0;
  opacity: 0.8;
}

.movie-poster {
  width: 15em;
}

@media (max-width: 50em) {
  section:nth-child(2) {
    flex-direction: column;
    padding: 0 1em;
    /* text-align: ; */
  }

  h2 {
    font-size: 1.7rem;
  }

  p {
    font-size: 1.2rem;
  }
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
</style>
