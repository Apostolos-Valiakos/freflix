<!-- https://coverapi.store/embed/tt3032476/ -->
<!-- IMDB ID -->

<template>
  <div v-if="movies.length > 0 && topMovie">
    <section>
      <v-img
        :src="'https://image.tmdb.org/t/p/original' + topMovie.backdrop_path"
        :lazy-src="
          'https://image.tmdb.org/t/p/original' + topMovie.backdrop_path
        "
        alt="Movie Poster"
        class="movie-banner grad"
        gradient="to bottom, rgba(0,0,0,0.2), rgba(0,0,0,1)"
      />
      <div style="z-index: 1">
        <h1>{{ topMovie.title }}</h1>
        <v-btn text color="white">
          {{ topMovie.vote_average }}
          According to IMDB Rating <br />
          out of {{ topMovie.vote_count }} votes
        </v-btn>
        <p class="synopsis">{{ topMovie.overview }}</p>
        <v-form class="button-container">
          <v-btn
            @click="handleMovieClick(topMovie.id)"
            style="color: red"
            color="white"
          >
            More information
          </v-btn>
          <v-btn
            @click="addToWatchlist(topMovie)"
            style="color: white"
            color="red"
            :disabled="isAdded"
          >
            Add to Watchlist
          </v-btn>
        </v-form>
        <div class="gradient"></div>
      </div>
    </section>
    <div style="background-color: black">
      <obras
        v-if="watchlist"
        :obras="watchlist"
        titulo="Watchlist"
        type="movie"
      />

      <obras
        v-if="newMovies"
        :obras="newMovies"
        titulo="Top Rated"
        type="movie"
      />

      <obras
        class="mt-n12"
        v-if="horrorItems"
        :obras="horrorItems"
        titulo="Horror"
        type="movie"
      />

      <obras
        class="mt-n12"
        v-if="fantasyItems"
        :obras="fantasyItems"
        titulo="Fantasy"
        type="movie"
      />

      <obras
        class="mt-n12"
        v-if="documentaryItems"
        :obras="documentaryItems"
        titulo="Documentary"
        type="movie"
      />
      <obras
        class="mt-n12"
        v-if="animationItems"
        :obras="animationItems"
        titulo="Animation"
        type="movie"
      />
    </div>
  </div>
</template>
<script
  async
  src="https://www.googletagmanager.com/gtag/js?id=G-XMRB0HFGVK"
></script>
<script>
<meta
  name="google-site-verification"
  content="2NXMENk8H7IDFXq7552Hyreo1Jmyb_K0DdXk83LJIMM"
/>;
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
      watchlist: [],
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
      watchlist: null,
    };
  },
  created() {
    if (localStorage.watchlist) {
      this.watchlist = localStorage.watchlist;
    } else {
      localStorage.watchlist = [];
    }
    this.getTopMovie("movie");
    this.initialize();
  },

  methods: {
    changeThePoster(list) {
      list.forEach((movie) => {
        if (!movie.hasOwnProperty("backdrop_path")) {
          movie.backdrop_path = movie.poster_path;
        }
      });
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

    async initialize() {
      const options = {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization:
            "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwYjE5NTM3NWNkODk0ZGRlNzkwOGNiNzIxMmQwMTBmOCIsInN1YiI6IjY1ODdmNjU1MmRmZmQ4NWNkYjQ0ZDkwNiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.XaBBhvFBh29o9x62S5G3BJ-KVofB-_clblrCU7PUj7M",
        },
      };
      //  "https://api.themoviedb.org/3/discover/movie?include_adult=false?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc",

      this.watchlist = JSON.parse(localStorage.getItem("watchlist") || "[]"); // Parse the watchlist from localStorage

      if (this.watchlist.length === 0) {
        // Check if the watchlist is empty
        this.watchlist = null; // Set watchlist to null if it is empty
      } else {
        if (!this.watchlist.poster_path) {
          this.watchlist.poster_path = this.watchlist.backdrop_path;
        } // Call changeThePoster if watchlist is not empty
      }

      this.newMovies = await fetch(
        "https://api.themoviedb.org/3/movie/top_rated?language=en-US&page=1",
        options
      )
        .then((res) => res.json())
        .then((data) => data.results);
      this.changeThePoster(this.newMovies);

      this.horrorItems = await fetch(
        "https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc&with_genres=27",
        options
      )
        .then((res) => res.json())
        .then((data) => data.results);
      this.changeThePoster(this.horrorItems);

      this.fantasyItems = await fetch(
        "https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc&with_genres=14",
        options
      )
        .then((res) => res.json())
        .then((data) => data.results);
      this.changeThePoster(this.fantasyItems);

      this.documentaryItems = await fetch(
        "https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc&with_genres=99",
        options
      )
        .then((res) => res.json())
        .then((data) => data.results);
      this.changeThePoster(this.documentaryItems);

      this.animationItems = await fetch(
        "https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc&with_genres=16",
        options
      )
        .then((res) => res.json())
        .then((data) => data.results);
      this.changeThePoster(this.animationItems);

      this.movies = await fetch(
        "https://api.themoviedb.org/3/movie/top_rated?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc",
        options
      )
        .then((res) => res.json())
        .then((data) => data.results);
      this.changeThePoster(this.movies);
    },
    handleMovieClick(id) {
      this.$router.push({ name: "info", query: { id: id } });
    },
    async getTopMovie(movie) {
      var url =
        "https://api.themoviedb.org/3/discover/" +
        movie +
        "?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc";
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
          let randMovieFromList = Math.floor(
            Math.random() * (json.results.length - 0 + 1) + 0
          );
          this.topMovie = json.results[randMovieFromList];
          this.topMovie.isSerie = "movie";
        })
        .catch((err) => console.error("error:" + err));
      url =
        "https://api.themoviedb.org/3/movie/" +
        this.topMovie.id +
        "?language=en-US";

      fetch(url, options)
        .then((res) => res.json())
        .then((json) => {
          this.topMovie.imdb_id = json.imdb_id;
        })
        .catch((err) => console.error("error:" + err));
      console.log(this.topMovie);
    },
    watchMovie(id) {
      location.href = "https://multiembed.mov/?video_id=" + id;
      // this.$router.push({ name: "watch", query: { id: id } });
    },
  },
};
</script>

<style>
section:first-child {
  height: 100vh;
  padding: 0 2.5em;
  display: flex;
  flex-direction: column;
  justify-content: center;
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
    rgba(25, 26, 26, 0.8) 60%,
    var(--dark-grey)
  );
  z-index: -1;
}

section:not(first-child) {
  padding: 3em 2.5em 0;
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

h1,
p {
  padding: 0;
  margin: 0;
  text-shadow: 2px 2px 4px rgb(0 0 0 / 45%);
}

h1 {
  font-size: 3rem;
  max-width: 20em;
}

.synopsis {
  font-size: 1.4vw;
  width: 100%;
  max-width: 30em;
  padding-top: 0.5rem;
  padding-bottom: 1rem;
}

button {
  all: unset;
  padding: 0.7rem 1.7rem;
  font-weight: bold;
  cursor: pointer;
}

.more-info-button {
  background-color: var(--red);
  color: var(--white);
  border-radius: 0.5em;
  padding: 0.7em 2em;
}

.more-info-button:hover {
  opacity: 0.9;
}

.cta-white {
  border-radius: 0.5em;
  color: var(--black);
  background-color: var(--white);
}

.cta-white:hover,
.cta-transparent:hover {
  opacity: 0.8;
}

.movie-grid {
  display: flex;
  gap: 1em;
  overflow-x: auto;
  height: 30em;
}

.movie-grid::-webkit-scrollbar {
  height: 5px;
}

.movie-poster {
  max-width: 15em;
  border-radius: 0.5em;
  margin-bottom: 1.5em;
}

.movie {
  position: relative;
}

.cta-transparent {
  border-radius: 0.5em;
  color: var(--white);
  background-color: var(--transparent);
}

@media (max-width: 50em) {
  section:first-child {
    padding: 10em 1em;
  }

  section:not(first-child) {
    padding: 0 1em;
  }

  h1 {
    margin-top: 4em;
    font-size: 2.5rem;
  }

  h2 {
    font-size: 1.3rem;
  }

  .synopsis {
    font-size: 1.2rem;
  }
}
.v-window.v-item-group.theme--dark.v-window--show-arrows-on-hover.v-carousel {
  height: 400px !important;
}
.grad {
  background: linear-gradient(to top, transparent, black);
}
</style>
