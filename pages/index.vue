<template>
  <v-container fluid class="pa-0 ma-0">
    <v-img
      class="imgFundoPrincipal"
      gradient="(200deg, rgba(0, 0, 0, 0) 0.50%, #000000 71.04%)"
    >
      <v-btn
        class="mt-3"
        style="text-align: right; display: flex; justify-content: center"
        to="searchResults"
        >Search</v-btn
      >
      <titulo
        v-if="topMovie"
        class="pb-10"
        :title="topMovie.title"
        :overview="topMovie.overview"
        :poster="'https://image.tmdb.org/t/p//w500' + topMovie.poster_path"
        :id="topMovie.id"
        :votes="topMovie.vote_average"
        :vote_count="topMovie.vote_count"
        :release_date="topMovie.release_date"
      />
      <obras class="pt-10" v-if="itemsUm" :obras="itemsUm" titulo="Fantasy" />
      <obras class="pt-5" v-if="itemsDois" :obras="itemsDois" titulo="Horror" />
      <obras
        class="pt-5"
        v-if="itemsTres"
        :obras="itemsTres"
        titulo="Documentary"
      />
      <obras
        class="pt-5"
        v-if="itemsQuatro"
        :obras="itemsQuatro"
        titulo="Animation"
      />
      <!-- <obras
        class="pt-5"
        :obras="itemsCinco"
        titulo="Séries aclamadas pela crítica"
      /> -->
    </v-img>
    <v-footer padless color="black" class="d-flex justify-center">
      <v-card
        flat
        tile
        color="black"
        width="60%"
        class="secondary--text text-start"
      >
        <v-card-text>
          <v-btn
            v-for="icon in icons"
            :key="icon"
            class="mx-4 white--text"
            icon
          >
            <v-icon size="24px">
              {{ icon }}
            </v-icon>
          </v-btn>
        </v-card-text>

        <v-row class="caption font-weight-light pa-0 ma-0">
          <v-col cols="3"> Audidescrição </v-col>
          <v-col cols="3"> Central de ajuda </v-col>
          <v-col cols="3"> Cartão pré-pago </v-col>
          <v-col cols="3"> Imprensa </v-col>
          <v-col cols="3"> Relação com investidores </v-col>
          <v-col cols="3"> Carreiras </v-col>
          <v-col cols="3"> Termos de uso </v-col>
          <v-col cols="3"> Privacidade </v-col>
          <v-col cols="3"> Avisos legais </v-col>
          <v-col cols="3"> Preferência de cookies </v-col>
          <v-col cols="3"> Informações corporativas </v-col>
          <v-col cols="3"> Entre em contato </v-col>
          <v-col class="pa-2 ml-2 mt-5" cols="2" style="border: 1px solid #ccc">
            Código do serviço
          </v-col>
          <v-col cols="12"> &copy; 1997-2023 Freflix, Inc. </v-col>
        </v-row>
      </v-card>
    </v-footer>
  </v-container>
</template>

<script>
import titulo from "../components/titulo";
import obras from "../components/obras";

export default {
  name: "Home",

  components: {
    titulo,
    obras,
  },

  data() {
    return {
      movieTitles: [],
      moviesFromDB: [],
      topMovie: null,
      topTitle: "",
      topOverview: "",
      topID: "",
      topImage: "https://image.tmdb.org/t/p//w500",
      itemsUm: [
        {
          title: "Test",
          image:
            "https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/A_black_image.jpg/640px-A_black_image.jpg",
          class: "test",
          isActive: "true",
          id: "0",
        },
      ],
      itemsDois: [
        {
          title: "Test",
          image:
            "https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/A_black_image.jpg/640px-A_black_image.jpg",
          class: "test",
          isActive: "true",
          id: "0",
        },
      ],
      itemsTres: [
        {
          title: "Test",
          image:
            "https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/A_black_image.jpg/640px-A_black_image.jpg",
          class: "test",
          isActive: "true",
          id: "0",
        },
      ],
      itemsQuatro: [
        {
          title: "Test",
          image:
            "https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/A_black_image.jpg/640px-A_black_image.jpg",
          class: "test",
          isActive: "true",
          id: "0",
        },
      ],
      itemsCinco: [],
      icons: ["mdi-facebook", "mdi-twitter", "mdi-linkedin", "mdi-instagram"],
    };
  },
  methods: {
    async getTopMovie() {
      const url =
        "https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc";
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
          console.log(json.results);
        })
        .catch((err) => console.error("error:" + err));
    },
    getNewAddedMovies() {
      const url =
        "https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc";
      const options = {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization:
            "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwYjE5NTM3NWNkODk0ZGRlNzkwOGNiNzIxMmQwMTBmOCIsInN1YiI6IjY1ODdmNjU1MmRmZmQ4NWNkYjQ0ZDkwNiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.XaBBhvFBh29o9x62S5G3BJ-KVofB-_clblrCU7PUj7M",
        },
      };

      fetch(url, options)
        .then((res) => res.json())
        .then(async (json) => {
          this.itemsUm.pop();
          for (let index = 0; index < 10; index++) {
            this.itemsUm.push(json.results[index]);
          }
        })
        .catch((err) => console.error("error:" + err));
    },
    getNowPlaying() {
      const url =
        "https://api.themoviedb.org/3/movie/now_playing?language=en-US&page=1";
      const options = {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization:
            "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwYjE5NTM3NWNkODk0ZGRlNzkwOGNiNzIxMmQwMTBmOCIsInN1YiI6IjY1ODdmNjU1MmRmZmQ4NWNkYjQ0ZDkwNiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.XaBBhvFBh29o9x62S5G3BJ-KVofB-_clblrCU7PUj7M",
        },
      };

      fetch(url, options)
        .then((res) => res.json())
        .then((json) => {
          this.itemsDois.pop();
          for (let index = 0; index < 10; index++) {
            this.itemsDois.push(json.results[index]);
          }
        })
        .catch((err) => console.error("error:" + err));
    },
    getPopular() {
      const url =
        "https://api.themoviedb.org/3/movie/popular?language=en-US&page=1";
      const options = {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization:
            "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwYjE5NTM3NWNkODk0ZGRlNzkwOGNiNzIxMmQwMTBmOCIsInN1YiI6IjY1ODdmNjU1MmRmZmQ4NWNkYjQ0ZDkwNiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.XaBBhvFBh29o9x62S5G3BJ-KVofB-_clblrCU7PUj7M",
        },
      };

      fetch(url, options)
        .then((res) => res.json())
        .then((json) => {
          this.itemsTres.pop();
          for (let index = 0; index < 10; index++) {
            this.itemsTres.push(json.results[index]);
          }
        })
        .catch((err) => console.error("error:" + err));
    },
    getMoviesperGerne(gerne, itemList) {
      const url =
        "https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc&with_genres=" +
        gerne;
      const options = {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization:
            "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwYjE5NTM3NWNkODk0ZGRlNzkwOGNiNzIxMmQwMTBmOCIsInN1YiI6IjY1ODdmNjU1MmRmZmQ4NWNkYjQ0ZDkwNiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.XaBBhvFBh29o9x62S5G3BJ-KVofB-_clblrCU7PUj7M",
        },
      };

      fetch(url, options)
        .then((res) => res.json())
        .then(async (json) => {
          itemList.pop();
          for (let index = 0; index < 10; index++) {
            itemList.push(json.results[index]);
          }
        })
        .catch((err) => console.error("error:" + err));
    },
    getTopRated() {
      const url =
        "https://api.themoviedb.org/3/movie/top_rated?language=en-US&page=1";
      const options = {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization:
            "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwYjE5NTM3NWNkODk0ZGRlNzkwOGNiNzIxMmQwMTBmOCIsInN1YiI6IjY1ODdmNjU1MmRmZmQ4NWNkYjQ0ZDkwNiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.XaBBhvFBh29o9x62S5G3BJ-KVofB-_clblrCU7PUj7M",
        },
      };

      fetch(url, options)
        .then((res) => res.json())
        .then((json) => {
          this.itemsQuatro.pop();
          for (let index = 0; index < 10; index++) {
            this.itemsQuatro.push(json.results[index]);
          }
        })
        .catch((err) => console.error("error:" + err));
    },
  },
  created() {
    this.getTopMovie();
    // this.getNewAddedMovies();
    // this.getNowPlaying();
    // this.getPopular();
    // this.getTopRated();
    this.getMoviesperGerne("14", this.itemsUm); //Fantasy
    this.getMoviesperGerne("27", this.itemsDois); //Horror
    this.getMoviesperGerne("99", this.itemsTres); //documentary
    this.getMoviesperGerne("16", this.itemsQuatro); //Animation
  },
};
</script>

<style>
.imgFundoPrincipal {
  background: #000;
  background-repeat: no-repeat;
  background-size: cover;
  height: 100%;
  width: 100%;
}
</style>
