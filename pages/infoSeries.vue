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
                <img
                  style="
                    text-align: right;
                    display: flex;
                    justify-content: center;
                  "
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
            <h2>{{ movie.name }}</h2>
            <h3>Last air date: {{ movie.last_air_date }}</h3>
            <p>{{ movie.overview }}</p>
            <br />
            <div class="my-3 text-center" v-if="isMobile">
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
            </div>
            <h3>
              Last Episode to air:
              <v-chip color="red">
                {{ movie.last_episode_to_air.name }}
              </v-chip>
            </h3>
            <p class="genre">Genre:</p>

            <div
              class="in-row"
              style="display: flex; flex-direction: row; flex-wrap: nowrap"
            >
              <div v-for="genre in movie.genres" :key="genre.id">
                <v-chip class="mx-1" color="red">
                  {{ genre.name }}
                </v-chip>
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

              <v-tab href="#tab-2"> Trailer </v-tab>
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
                      :src="'https://coverapi.store/embed/' + imdb_id"
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
        class="d-flex align-content-center flex-wrap bg-surface-variant"
        style="
          background-color: black;
          text-align: center;
          justify-content: center;
        "
      >
        <!-- <h4 class="text-h5 font-weight-bold mb-4">Similar Movies</h4> -->

        <div v-for="(item, index) in similarMovies" :key="index">
          <!-- Στο κλικ να ενημερώνεται το topMovie και το SimilarMovies -->
          <!-- {{ item }} -->
          <v-card
            @click="handleClick(item)"
            style="background-color: black"
            v-if="item !== undefined && item.poster_path"
            width="200"
            height="300"
          >
            <a :href="'/infoSeries?id=' + item.id">
              <v-img
                style="background-color: black"
                contain
                class="mt-2 movie-poster"
                :src="'https://image.tmdb.org/t/p//w500' + item.poster_path"
                max-width="200"
                max-height="200"
              />
            </a>
            <v-card-text
              style="text-align: center; justify-content: center; display: flex"
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
