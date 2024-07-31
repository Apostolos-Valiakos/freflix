<template>
  <div>
    <div v-if="isEmpty">
      <h1 class="mt-10">The History is Empty!!!</h1>
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
                @click="removeFromhistory(index)"
              >
                remove from history
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
      history: [],
      results: [],
    };
  },
  created() {
    if (window.localStorage.getItem("history")) {
      this.results = window.localStorage.getItem("history");
      this.results = JSON.parse(this.results);
      this.results = this.results.reverse();
    } else {
      this.isEmpty = true;
    }
  },
  methods: {
    addTohistory(movie) {
      var historyFromLocalStorage = JSON.parse(
        localStorage.getItem("history") || "[]"
      );
      historyFromLocalStorage.push(movie);
      localStorage.setItem("history", JSON.stringify(historyFromLocalStorage));
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
    removeFromhistory(index) {
      this.results.splice(index, 1);
      localStorage.setItem("history", JSON.stringify(this.results));
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
