<template>
  <v-container fluid class="pa-0 ma-0">
    <v-img
      class="imgFundoPrincipal"
      gradient="(200deg, rgba(0, 0, 0, 0) 0.50%, #000000 71.04%)"
    >
      <v-text-field label="Search" v-model="searchTerm" />
      <v-btn @click="search(1)">GO</v-btn>
      <h2 class="page-title">Search Results for "{{ searchTerm }}"</h2>
      <v-row>
        <v-col
          v-for="(movie, index) in searchResults"
          :key="index"
          cols="12"
          sm="6"
          md="4"
          lg="3"
        >
          <v-card class="mb-4">
            <v-img
              :src="'https://image.tmdb.org/t/p//w500' + movie.backdrop_path"
            />
            <v-card-title>{{ movie.title }}</v-card-title>
            <!-- Add more movie details or actions -->
            <v-card-subtitle>
              {{ movie.overview }}
            </v-card-subtitle>
            <v-card-actions>
              <v-btn color="green darken-1" @click="seeMovie(movie.id)">
                Play
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
      <v-pagination
        rounded
        :length="noOfPages"
        @input="updatePagination"
      ></v-pagination>
    </v-img>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      noOfPages: 0,
      searchTerm: "", // Search term passed to this page
      searchResults: [], // List of movies received from the search
    };
  },
  methods: {
    updatePagination(pagination) {
      this.search(pagination);
    },
    seeMovie(link) {
      location.href = "https://autoembed.to/movie/tmdb/" + link;
    },
    async search(page) {
      console.log(page);
      try {
        const url =
          "https://api.themoviedb.org/3/search/movie?query=" +
          this.searchTerm +
          "&include_adult=false&language=en-US&page=" +
          page;
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
          .then((json) => {
            console.log(json);
            this.noOfPages = json.total_pages;
            this.searchResults = json.results;
          })
          .catch((err) => console.error("error:" + err));
        // Adjust this based on your API response structure
      } catch (error) {
        alert("Error fetching search results:", error);
      }
    },
  },
};
</script>

<style>
/* Add custom styles for the search results page */
.page-title {
  margin-top: 30px;
  margin-bottom: 20px;
  font-size: 24px;
  font-weight: bold;
}
.imgFundoPrincipal {
  background: #000;
  background-repeat: no-repeat;
  background-size: cover;
  height: 100%;
  width: 100%;
}
</style>
