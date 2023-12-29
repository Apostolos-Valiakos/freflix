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
      >
        Search
      </v-btn>
      <v-btn
        to="/"
        class="mt-3"
        style="text-align: right; display: flex; justify-content: center"
      >
        Movies
      </v-btn>
      <v-btn @click="showDialog = true">show</v-btn>

      <titulo v-if="topMovie" class="pb-10" v-bind="topMovie" />
      <seriesCarousel
        class="pt-10"
        v-if="fantasyItems"
        :obras="fantasyItems"
        titulo="Fantasy"
      />
      <seriesCarousel
        class="pt-5"
        v-if="crimeItems"
        :obras="crimeItems"
        titulo="Crime"
      />
      <seriesCarousel
        class="pt-5"
        v-if="documentaryItems"
        :obras="documentaryItems"
        titulo="Documentary"
      />
      <seriesCarousel
        class="pt-5"
        v-if="animationItems"
        :obras="animationItems"
        titulo="Animation"
      />
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
import seriesCarousel from "../components/seriesCarousel";

export default {
  name: "Home",

  components: {
    titulo,
    obras,
    seriesCarousel,
  },

  data() {
    return {
      showDialog: false,
      movieTitles: [],
      moviesFromDB: [],
      topMovie: null,
      topTitle: "",
      topOverview: "",
      topID: "",
      topImage: "https://image.tmdb.org/t/p//w500",
      fantasyItems: [
        {
          title: "Test",
          image:
            "https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/A_black_image.jpg/640px-A_black_image.jpg",
          class: "test",
          isActive: "true",
          id: "0",
        },
      ],
      crimeItems: [
        {
          title: "Test",
          image:
            "https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/A_black_image.jpg/640px-A_black_image.jpg",
          class: "test",
          isActive: "true",
          id: "0",
        },
      ],
      documentaryItems: [
        {
          title: "Test",
          image:
            "https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/A_black_image.jpg/640px-A_black_image.jpg",
          class: "test",
          isActive: "true",
          id: "0",
        },
      ],
      animationItems: [
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
    async getTopMovie(movie) {
      const url =
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
          this.topMovie.isSerie = "tv";
        })
        .catch((err) => console.error("error:" + err));
    },
    getNewAddedMovies(movie) {
      const url =
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

      fetch(url, options)
        .then((res) => res.json())
        .then(async (json) => {
          this.fantasyItems.pop();
          for (let index = 0; index < 10; index++) {
            this.fantasyItems.push(json.results[index]);
          }
        })
        .catch((err) => console.error("error:" + err));
    },
    getNowPlaying(movie) {
      const url =
        "https://api.themoviedb.org/3/" +
        movie +
        "/now_playing?language=en-US&page=1";
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
          this.crimeItems.pop();
          for (let index = 0; index < 10; index++) {
            this.crimeItems.push(json.results[index]);
          }
        })
        .catch((err) => console.error("error:" + err));
    },
    getPopular(movie) {
      const url =
        "https://api.themoviedb.org/3/" +
        movie +
        "/popular?language=en-US&page=1";
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
          this.documentaryItems.pop();
          for (let index = 0; index < 10; index++) {
            this.documentaryItems.push(json.results[index]);
          }
        })
        .catch((err) => console.error("error:" + err));
    },
    getMoviesperGerne(gerne, itemList, movie) {
      const url =
        "https://api.themoviedb.org/3/discover/" +
        movie +
        "?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc&with_genres=" +
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
            itemList[index] = json.results[index];
          }
        })
        .catch((err) => console.error("error:" + err));
    },
    getTopRated(movie) {
      const url =
        "https://api.themoviedb.org/3/" +
        movie +
        "/top_rated?language=en-US&page=1";
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
          this.animationItems.pop();
          for (let index = 0; index < 10; index++) {
            this.animationItems.push(json.results[index]);
          }
        })
        .catch((err) => console.error("error:" + err));
    },
  },
  created() {
    this.getTopMovie("tv");
    this.getMoviesperGerne("10765", this.fantasyItems, "tv"); //Fantasy
    this.getMoviesperGerne("80", this.crimeItems, "tv"); //Horror
    this.getMoviesperGerne("99", this.documentaryItems, "tv"); //documentary
    this.getMoviesperGerne("16", this.animationItems, "tv"); //Animation
    console.log(this.animationItems);
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
