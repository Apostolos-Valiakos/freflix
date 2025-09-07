<template>
  <div :style="marginFromTop">
    <div class="d-flex justify-space-around mb-6 bg-surface-variant">
      <v-text-field
        color="red"
        class="ma-2 pa-2"
        label="Search"
        v-model="searchTerm"
        @change="search(1)"
      />
      <!-- @change="autocomplete" -->
      <v-select
        color="red"
        class="ma-2 pa-2"
        v-if="categories || seriesCategories"
        @change="searchPerCategory(selectedCategory, 1)"
        :item-text="'name'"
        :item-value="'id'"
        v-model="selectedCategory"
        label="Search by Category"
        :items="isSerie ? seriesCategories : categories"
      />
    </div>
    <v-checkbox
      class="ma-2 pa-2"
      color="red"
      label="Looking for Series"
      v-model="isSerie"
    ></v-checkbox>

    <v-btn class="mx-5 mb-8" @click="search(1)" color="red"> Search </v-btn>

    <h2 class="page-title" v-if="searchTerm">
      Search Results for "{{ searchTerm }}"
    </h2>
    <v-chip
      @click="searchFromChip(item)"
      class="mr-2 my-2"
      color="red"
      v-for="item in autocompleteItems"
      :key="item.id"
    >
      {{ item.name }}
    </v-chip>
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
            @click="seeInfo(movie.id)"
            :src="'https://image.tmdb.org/t/p//w500' + movie.backdrop_path"
          />
          <v-card-title>
            {{ movie.name || movie.title }}
            <h5 class="mx-2">
              ({{ movie.first_air_date || movie.release_date }})
            </h5>
          </v-card-title>
          <!-- Add more movie details or actions -->
          <v-card-subtitle>
            {{ movie.overview }}
          </v-card-subtitle>
          <v-card-actions>
            <!-- <v-btn color="red" @click="seeMovie(movie.id)" style="color: white">
              Play
            </v-btn> -->
            <v-btn color="white" @click="seeInfo(movie.id)" style="color: red">
              Info
            </v-btn>
            <v-btn
              @click="addToWatchlist(movie)"
              style="color: white"
              color="red"
            >
              Add to watchlist
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
    <div class="text-center">
      <v-pagination
        v-if="noOfPages"
        :length="noOfPages"
        color="#f44336"
        v-model="page"
        @input="updatePagination"
      ></v-pagination>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      marginFromTop: "margin-top: 100px",
      showEmbed: false,
      page: 1,
      isSerie: false,
      autocompleteItems: [],
      embedLink: "",
      selectedCategory: "",
      categories: [],
      seriesCategories: [],
      noOfPages: 0,
      searchTerm: "", // Search term passed to this page
      searchResults: [], // List of movies received from the search
    };
  },
  methods: {
    saveFilters() {
      const filters = {
        isSerie: this.isSerie,
        searchTerm: this.searchTerm,
      };

      localStorage.setItem("searchFilters", JSON.stringify(filters));
    },
    loadFilters() {
      const filtersFromLocalStorage = JSON.parse(
        localStorage.getItem("searchFilters") || "{}"
      );

      if (filtersFromLocalStorage.hasOwnProperty("isSerie")) {
        this.isSerie = filtersFromLocalStorage.isSerie;
      }
      if (filtersFromLocalStorage.hasOwnProperty("searchTerm")) {
        this.searchTerm = filtersFromLocalStorage.searchTerm;
      }
    },
    addToWatchlist(movie) {
      if (this.isSerie) {
        movie.isSerie = "tv";
      } else {
        movie.isSerie = "movie";
      }

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
    },
    searchFromChip(item) {
      this.searchTerm = item.name;
      const url =
        "https://api.themoviedb.org/3/keyword/" +
        item.id +
        "/movies?include_adult=false&language=en-US&page=1";
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
          this.noOfPages = json.total_pages;
          if (this.noOfPages > 100) {
            this.noOfPages = 50;
          }
          this.searchResults = json.results;
        })
        .catch((err) => console.error("error:" + err));
      this.autocomplete();
    },
    autocomplete() {
      const url =
        "https://api.themoviedb.org/3/search/keyword?query=" +
        this.searchTerm +
        "&page=1";
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
          this.autocompleteItems = json.results;
        })
        .catch((err) => console.error("error:" + err));
    },
    seeInfo(id) {
      if (this.isSerie) {
        this.$router.push({
          name: "infoSeries",
          query: { id: id },
        });
      } else {
        this.$router.push({ name: "info", query: { id: id } });
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
            this.noOfPages = json.total_pages;
            if (this.noOfPages > 100) {
              this.noOfPages = 50;
            }
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
            this.noOfPages = json.total_pages;
            if (this.noOfPages > 100) {
              this.noOfPages = 50;
            }
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
      window.scrollTo(0, 0);
    },
    seeMovie(link) {
      if (this.isSerie) {
        location.href =
          "https://multiembed.mov/?video_id=" + link + "&tmdb=1&s=1&e=1";
      } else {
        location.href = "https://multiembed.mov/?video_id=" + link + "&tmdb=1";
        // this.$router.push({ name: "watch", query: { id: link } });
      }
    },
    async search(page) {
      this.searchResults = [];
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
              this.noOfPages = json.total_pages;
              if (this.noOfPages > 100) {
                this.noOfPages = 50;
              }
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
              this.noOfPages = json.total_pages;
              if (this.noOfPages > 100) {
                this.noOfPages = 50;
              }
              this.searchResults = json.results;
            })
            .catch((err) => console.error("error:" + err));
          // Adjust this based on your API response structure
        } catch (error) {
          alert("Error fetching search results:", error);
        }
      }
      this.autocomplete();
      this.saveFilters();
    },
    getPopularMovies() {
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
          this.noOfPages = json.total_pages;
          if (this.noOfPages > 100) {
            this.noOfPages = 50;
          }
          this.searchResults = json.results;
        })
        .catch((err) => console.error("error:" + err));
    },
    getSeriesCategories() {
      const url = "https://api.themoviedb.org/3/genre/tv/list?language=en";
      const options = {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization:
            "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwYjE5NTM3NWNkODk0ZGRlNzkwOGNiNzIxMmQwMTBmOCIsIm5iZiI6MTcwMzQwOTIzNy42MDE5OTk4LCJzdWIiOiI2NTg3ZjY1NTJkZmZkODVjZGI0NGQ5MDYiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.74U2ndKrTu5lyaGDxrPDGKJNVMjCen72gWPGG75oWcs",
        },
      };

      fetch(url, options)
        .then((res) => res.json())
        .then((json) => (this.seriesCategories = json.genres))
        .catch((err) => console.error(err));
    },
    getCategories() {
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
    initializeFunction() {
      this.getPopularMovies();
      if (screen.width < 450) {
        this.marginFromTop = "margin-top: 0px";
      }
      this.getCategories();
      this.getSeriesCategories();
      this.loadFilters();
    },
  },
  created() {
    if (
      localStorage.getItem("searchFilters") &&
      localStorage.getItem("searchFilters").length > 0
    ) {
      this.loadFilters();
      this.search(1);
    } else {
      this.initializeFunction();
    }
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
.pagination .v-pagination {
  width: 100%; /* Allow the pagination container to adjust according to the screen size */
  display: flex;
  justify-content: center; /* Center the pagination component */
  padding: 0;
  margin: 0;
}
.v-pagination {
  flex-wrap: wrap !important; /* Allow the buttons to wrap onto multiple lines if necessary */
}
</style>
