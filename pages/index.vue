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
        class="pb-10"
        :title="topTitle"
        :overview="topOverview"
        :poster="topImage"
        :id="topID"
      />
      <obras class="pt-10" :obras="itemsUm" titulo="Νέες Κυκλοφορίες" />
      <obras class="pt-5" :obras="itemsDois" titulo="Comedy" />
      <obras class="pt-5" :obras="itemsTres" titulo="Documentary" />
      <obras class="pt-5" :obras="itemsQuatro" titulo="Animation" />
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
    getTopMovie() {
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
          this.topTitle = json.results[0].title;
          this.topOverview = json.results[0].overview;
          this.topImage += json.results[0].poster_path;
          this.topID = "https://autoembed.to/movie/tmdb/" + json.results[0].id;
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
            this.itemsUm.push({
              title: json.results[index].title,
              poster_path:
                "https://image.tmdb.org/t/p//w500" +
                json.results[index].poster_path,
              isActive: true,
              class: json.results[index].title,
              overview: json.results[index].overview,
              id: json.results[index].id,
            });
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
            itemList.push({
              title: json.results[index].title,
              poster_path: json.results[index].poster_path,
              isActive: true,
              class: json.results[index].title,
              overview: json.results[index].overview,
              id: json.results[index].id,
            });
          }
        })
        .catch((err) => console.error("error:" + err));
    },
  },
  created() {
    this.getTopMovie();
    this.getNewAddedMovies();
    this.getMoviesperGerne("35", this.itemsDois); //comedy
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
