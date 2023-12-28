<template>
  <v-container fluid class="pa-0 ma-0">
    <v-img
      class="imgFundoPrincipal"
      gradient="(200deg, rgba(0, 0, 0, 0) 0.50%, #000000 71.04%)"
    >
      <v-text-field label="Search" v-model="searchTerm" />
      <v-btn @click="search(1)">GO</v-btn>
      <v-select
        v-if="categories"
        @change="searchPerCategory(selectedCategory, 1)"
        :item-text="'name'"
        :item-value="'id'"
        v-model="selectedCategory"
        label="Search by Category"
        :items="categories"
      ></v-select>
      <h2 class="page-title" v-if="searchTerm">
        Search Results for "{{ searchTerm }}"
      </h2>
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
        v-if="noOfPages"
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
      selectedCategory: "",
      categories: [],
      noOfPages: 0,
      searchTerm: "", // Search term passed to this page
      searchResults: [], // List of movies received from the search
    };
  },
  methods: {
    searchPerCategory(selectedCategory, pagination) {
      if (!pagination) {
        pagination = 1;
      }
      const url =
        "https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=" +
        pagination +
        "&sort_by=popularity.desc&with_genres=" +
        selectedCategory;
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
          console.log(json);
          this.noOfPages = json.total_pages;
          this.searchResults = json.results;
        })
        .catch((err) => console.error("error:" + err));
    },
    updatePagination(pagination) {
      if (this.searchTerm) {
        this.search(pagination);
      } else {
        this.searchPerCategory(this.selectedCategory, pagination);
      }
    },
    seeMovie(link) {
      location.href = "https://autoembed.to/movie/tmdb/" + link;
    },
    async search(page) {
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
  created() {
    const url = "https://api.themoviedb.org/3/genre/movie/list?language=en";
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
      .then((json) => (this.categories = json.genres))
      .catch((err) => console.error("error:" + err));
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
