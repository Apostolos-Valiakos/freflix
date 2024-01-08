<template>
  <div style="margin-top: 100px">
    <v-text-field label="Search" v-model="searchTerm" @change="search(1)" />
    <v-select
      v-if="categories"
      @change="searchPerCategory(selectedCategory, 1)"
      :item-text="'name'"
      :item-value="'id'"
      v-model="selectedCategory"
      label="Search by Category"
      :items="categories"
    ></v-select>
    <v-checkbox label="Looking for Serie" v-model="isSerie"></v-checkbox>
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
          <v-card-title v-if="isSerie">{{ movie.name }}</v-card-title>
          <v-card-title v-else>{{ movie.title }}</v-card-title>
          <!-- Add more movie details or actions -->
          <v-card-subtitle>
            {{ movie.overview }}
          </v-card-subtitle>
          <v-card-actions>
            <v-btn color="green darken-1" @click="seeMovie(movie.id)">
              Play
            </v-btn>
            <v-btn color="grey darken-1" @click="seeInfo(movie.id)">
              Info
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
    <v-pagination
      v-if="noOfPages"
      style="text-align: center; justify-content: center; display: flex"
      rounded
      :length="noOfPages"
      @input="updatePagination"
    ></v-pagination>
  </div>
</template>

<script>
export default {
  data() {
    return {
      showEmbed: false,
      isSerie: false,
      embedLink: "",
      selectedCategory: "",
      categories: [],
      noOfPages: 0,
      searchTerm: "", // Search term passed to this page
      searchResults: [], // List of movies received from the search
    };
  },
  methods: {
    seeInfo(id) {
      if (this.isSerie) {
        this.$router.push({
          name: "infoSeries",
          params: { id: id },
        });
      } else {
        this.$router.push({ name: "info", params: { id: id } });
      }
    },
    searchPerCategory(selectedCategory, pagination) {
      if (!pagination) {
        pagination = 1;
      }
      if (this.isSerie) {
        const url =
          "https://api.themoviedb.org/3/discover/tv?include_adult=false&include_video=false&language=en-US&page=" +
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
      } else {
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
      }
    },
    updatePagination(pagination) {
      if (this.searchTerm) {
        this.search(pagination);
      } else {
        this.searchPerCategory(this.selectedCategory, pagination);
      }
    },
    seeMovie(link) {
      if (this.isSerie) {
        location.href =
          "https://multiembed.mov/?video_id=" + link + "&tmdb=1&s=1&e=1";
      } else {
        location.href = "https://multiembed.mov/?video_id=" + link + "&tmdb=1";
      }
    },
    async search(page) {
      if (this.isSerie) {
        try {
          const url =
            "https://api.themoviedb.org/3/search/tv?query=" +
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
      } else {
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
