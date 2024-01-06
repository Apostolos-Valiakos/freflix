<!-- https://getsuperembed.link/?video_id=imdbId -->
<!-- IMDB LINK -->
<!-- Parse the response link -->
<template>
  <div v-if="movies.length > 0">
    <section>
      <v-img
        :src="'https://image.tmdb.org/t/p/original' + topMovie.poster_path"
        alt="Movie Poster"
        class="movie-banner"
      />
      <div style="z-index: 1">
        <h1>{{ topMovie.original_title }}</h1>
        <p class="synopsis">{{ topMovie.overview }}</p>
        <v-form class="button-container">
          <v-btn @click="watchMovie(topMovie.imdb_id)">Watch</v-btn>
          <button class="cta-transparent">📖 More information</button>
        </v-form>
        <div class="gradient"></div>
      </div>
    </section>
    <obras class="pt-10" v-if="movies" :obras="movies" titulo="Top Rated" />

    <obras
      class="pt-10"
      v-if="horrorItems"
      :obras="horrorItems"
      titulo="Horror"
    />

    <obras
      class="pt-10"
      v-if="fantasyItems"
      :obras="fantasyItems"
      titulo="Fantasy"
    />

    <obras
      class="pt-5"
      v-if="documentaryItems"
      :obras="documentaryItems"
      titulo="Documentary"
    />
    <obras
      class="pt-5"
      v-if="animationItems"
      :obras="animationItems"
      titulo="Animation"
    />
  </div>
</template>

<script>
export default {
  transition: {
    name: "layout",
    mode: "out-in",
  },

  data() {
    return {
      topMovie: null,
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
  created() {
    this.initialize();
    this.getTopMovie("movie");
    // this.getMoviesperGerne("27", this.horrorItems, "movie");
  },

  methods: {
    async initialize() {
      const options = {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization:
            "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwYjE5NTM3NWNkODk0ZGRlNzkwOGNiNzIxMmQwMTBmOCIsInN1YiI6IjY1ODdmNjU1MmRmZmQ4NWNkYjQ0ZDkwNiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.XaBBhvFBh29o9x62S5G3BJ-KVofB-_clblrCU7PUj7M",
        },
      };

      this.horrorItems = await fetch(
        "https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc&with_genres=27",
        options
      )
        .then((res) => res.json())
        .then((data) => data.results);

      this.fantasyItems = await fetch(
        "https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc&with_genres=14",
        options
      )
        .then((res) => res.json())
        .then((data) => data.results);

      this.documentaryItems = await fetch(
        "https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc&with_genres=99",
        options
      )
        .then((res) => res.json())
        .then((data) => data.results);

      this.animationItems = await fetch(
        "https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc&with_genres=16",
        options
      )
        .then((res) => res.json())
        .then((data) => data.results);

      this.movies = await fetch(
        "https://api.themoviedb.org/3/movie/top_rated?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc",
        options
      )
        .then((res) => res.json())
        .then((data) => data.results);
    },

    handleMovieClick(movie) {
      this.$router.push({
        name: "movies-movieid",
        params: { movieid: movie.id },
      });
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
    },
    async watchMovie(id) {
      // const link = "https://www.getsuperembed.link/?video_id=" + id; // Replace with the link you want to fetch
      // console.log(link);
      const options = {
        method: "GET",
        headers: {
          accept: "application/json",
        },
      };
      let link = await fetch(
        "https://getsuperembed.link/?video_id=" + id,
        options
      );
      console.log(link);
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
</style>
