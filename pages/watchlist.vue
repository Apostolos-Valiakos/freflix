<template>
  <div>
    <div v-if="isEmpty">
      <h1 class="mt-10">The Watchlist is Empty!!!</h1>
    </div>
    <div v-else style="margin-top: 100px">
      <v-row v-if="results">
        <v-col
          v-for="(movie, index) in results"
          :key="index"
          cols="12"
          sm="6"
          md="4"
          lg="3"
        >
          <v-card>
            <v-img
              :src="'https://image.tmdb.org/t/p//w500' + movie.backdrop_path"
              @click="seeInfo(movie)"
            />

            <v-card-title v-if="movie.isSerie == 'tv'">{{
              movie.name
            }}</v-card-title>
            <v-card-title v-else>{{ movie.title }}</v-card-title>
            <v-card-subtitle>
              {{ movie.overview }}
            </v-card-subtitle>
            <v-card-actions>
              <v-btn
                style="
                  color: red;
                  display: flex;
                  text-align: center;
                  justify-content: center;
                "
                color="white"
                @click="removeFromWatchList(index)"
              >
                remove from watchlist
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      isEmpty: false,
      watchlist: [],
      results: [],
    };
  },
  created() {
    if (window.localStorage.getItem("watchlist")) {
      this.results = window.localStorage.getItem("watchlist");
      this.results = JSON.parse(this.results);
      console.log(this.results);
    } else {
      this.isEmpty = true;
    }
  },
  methods: {
    addToWatchlist(movie) {
      var watchlistFromLocalStorage = JSON.parse(
        localStorage.getItem("watchlist") || "[]"
      );
      watchlistFromLocalStorage.push(movie);
      localStorage.setItem(
        "watchlist",
        JSON.stringify(watchlistFromLocalStorage)
      );
    },
    seeInfo(movie) {
      if (movie.isSerie === "tv") {
        this.$router.push({
          name: "infoSeries",
          query: { id: movie.id },
        });
      } else {
        this.$router.push({ name: "info", query: { id: movie.id } });
      }
    },
    removeFromWatchList(index) {
      this.results.splice(index, 1);
      localStorage.setItem("watchlist", JSON.stringify(this.results));
    },
  },
};
</script>
<style>
.space-above {
  margin-top: 100px;
  margin: 0; /* Reset default margin */
}
</style>
