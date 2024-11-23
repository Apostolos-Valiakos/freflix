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
            <v-img
              contain
              class="mt-2 movie-poster"
              :src="'https://image.tmdb.org/t/p//w500' + item.poster_path"
              max-width="200"
              max-height="200"
            />
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
    };
  },
  async created() {
    this.isMobile = screen.width < 450;
    if (this.$route.query.id) {
      this.query = this.$route.query.id;
      this.setCookie("id", this.query, 1);
    } else {
      this.query = this.getCookie("id");
    }

    await this.getTopMovie(this.query);
    await this.getSimilarMovies(this.query);

    // Initialize isAdded here
    this.isAdded = this.movieExistsInArray(
      this.movie,
      JSON.parse(localStorage.getItem("watchlist") || "[]")
    );
    this.getCredits(this.movie);
  },
  methods: {
    getCredits(movie) {
      const url = `https://api.themoviedb.org/3/movie/${movie.id}/credits?language=en-US`;
      const options = {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization:
            "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwYjE5NTM3NWNkODk0ZGRlNzkwOGNiNzIxMmQwMTBmOCIsIm5iZiI6MTczMDkyMDMxNC4yMzg4MjIsInN1YiI6IjY1ODdmNjU1MmRmZmQ4NWNkYjQ0ZDkwNiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.6xq36kNsh7lPZGElIUB-gyelOmB2x2WQQOUXCAEfIiY",
        },
      };

      fetch(url, options)
        .then((res) => res.json())
        .then((json) => {
          this.credits = json.cast;
        })
        .catch((err) => console.error(err));
    },
    removeFromWatchList(movie) {
      var watchlistFromLocalStorage = JSON.parse(
        localStorage.getItem("watchlist") || "[]"
      );
      var index = watchlistFromLocalStorage.findIndex(
        (item) => item.id === movie.id
      );
      watchlistFromLocalStorage.splice(index, 1);
      localStorage.setItem(
        "watchlist",
        JSON.stringify(watchlistFromLocalStorage)
      );
      this.isAdded = false;
    },
    movieExistsInArray(movie, array) {
      return array.some(
        (item) => item.id === movie.id && item.isSerie === movie.isSerie
      );
    },
    addToHistory(movie) {
      movie.isSerie = "movie";
      var historyFromLocalStorage = JSON.parse(
        localStorage.getItem("history") || "[]"
      );

      // Find the index of the movie in the history
      var movieIndex = historyFromLocalStorage.findIndex(
        (item) => item.id === movie.id && item.isSerie === movie.isSerie
      );

      if (movieIndex === -1) {
        // If the movie doesn't exist, add it to the history
        historyFromLocalStorage.push(movie);
      } else {
        // If the movie exists, remove it from its current position and add to the end of the array
        historyFromLocalStorage.splice(movieIndex, 1);
        historyFromLocalStorage.push(movie);
      }

      localStorage.setItem("history", JSON.stringify(historyFromLocalStorage));
    },
    watchMovie(id) {
      location.href = `https://multiembed.mov/?video_id=${id}`;
    },
    addToWatchlist(movie) {
      movie.isSerie = "movie";
      var watchlistFromLocalStorage = JSON.parse(
        localStorage.getItem("watchlist") || "[]"
      );

      // Find the index of the movie in the watchlist
      var movieIndex = watchlistFromLocalStorage.findIndex(
        (item) => item.id === movie.id && item.isSerie === movie.isSerie
      );

      if (movieIndex === -1) {
        // If the movie doesn't exist, add it to the watchlist
        watchlistFromLocalStorage.push(movie);
      } else {
        // If the movie exists, remove it from its current position and add to the first position
        watchlistFromLocalStorage.splice(movieIndex, 1);
        watchlistFromLocalStorage.unshift(movie);
      }

      localStorage.setItem(
        "watchlist",
        JSON.stringify(watchlistFromLocalStorage)
      );
      this.isAdded = true;
    },
    setCookie(name, value, days) {
      var expires = "";
      if (days) {
        var date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        expires = "; expires=" + date.toUTCString();
      }
      document.cookie = name + "=" + (value || "") + expires + "; path=/";
    },
    getCookie(name) {
      var nameEQ = name + "=";
      var ca = document.cookie.split(";");
      for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == " ") c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
      }
      return null;
    },
    eraseCookie(name) {
      document.cookie =
        name + "=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    },
    async getTopMovie(id) {
      this.movie = await fetch(
        `https://api.themoviedb.org/3/movie/${id}?api_key=5b75818e63dfdb396cadedf77425b334&language=en-US&page=1`
      ).then((res) => res.json());
      console.log(this.movie);
      this.addToHistory(this.movie);
    },
    ClickOnSimilarMovies(item) {
      this.getTopMovie(item.id);
      this.getSimilarMovies(item.id);
      this.getCredits(item.id);
      this.eraseCookie("id");
      this.setCookie("id", item.id, 1);
      this.isAdded = this.movieExistsInArray(
        this.item,
        JSON.parse(localStorage.getItem("watchlist") || "[]")
      );
    },
    async getSimilarMovies(ID) {
      this.similarMovies = [];
      const url =
        "https://api.themoviedb.org/3/movie/" +
        ID +
        "/recommendations?language=en-US&page=1";
      const options = {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization:
            "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwYjE5NTM3NWNkODk0ZGRlNzkwOGNiNzIxMmQwMTBmOCIsInN1YiI6IjY1ODdmNjU1MmRmZmQ4NWNkYjQ0ZDkwNiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.XaBBhvFBh29o9x62S5G3BJ-KVofB-_clblrCU7PUj7M",
        },
      };

      await fetch(url, options)
        .then((res) => res.json())
        .then(async (json) => {
          for (let index = 0; index < json.results.length; index++) {
            const element = json.results[index];
            if (element !== undefined) {
              this.similarMovies.push(element);
            }
          }
          this.similarMovies.splice(0, 1);
        })
        .catch((err) => console.error("error:" + err));
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
