<template>
  <div :style="marginFromTop">
    <div
      class="search-header d-flex justify-space-around mb-6 bg-surface-variant"
    >
      <v-text-field
        color="red"
        class="ma-2 pa-2 search-field"
        label="Search"
        v-model="searchTerm"
        @change="search(1)"
      />
      <!-- @change="autocomplete" -->
      <v-select
        color="red"
        class="ma-2 pa-2 category-select"
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
      class="ma-2 pa-2 series-checkbox"
      color="red"
      label="Looking for Series"
      v-model="isSerie"
    ></v-checkbox>

    <v-btn class="mx-5 mb-8 search-btn" @click="search(1)" color="red">
      Search
    </v-btn>

    <h2 class="page-title" v-if="searchTerm">
      Search Results for "{{ searchTerm }}"
    </h2>
    <div class="autocomplete-chips">
      <v-chip
        @click="searchFromChip(item)"
        class="mr-2 my-2 autocomplete-chip"
        color="red"
        v-for="item in autocompleteItems"
        :key="item.id"
      >
        {{ item.name }}
      </v-chip>
    </div>
    <v-row class="results-grid">
      <v-col
        v-for="(movie, index) in searchResults"
        :key="index"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <v-card class="mb-4 movie-card">
          <v-img
            @click="seeInfo(movie.id)"
            :src="'https://image.tmdb.org/t/p//w500' + movie.backdrop_path"
            class="movie-image"
          />
          <v-card-title class="movie-title-section">
            {{ movie.name || movie.title }}
            <h5 class="movie-date">
              ({{ movie.first_air_date || movie.release_date }})
            </h5>
          </v-card-title>
          <!-- Add more movie details or actions -->
          <v-card-subtitle class="movie-overview">
            {{ movie.overview }}
          </v-card-subtitle>
          <v-card-actions class="movie-actions">
            <!-- <v-btn color="red" @click="seeMovie(movie.id)" style="color: white">
              Play
            </v-btn> -->
            <v-btn
              color="white"
              @click="seeInfo(movie.id)"
              class="info-btn"
              style="color: red"
            >
              Info
            </v-btn>
            <v-btn
              @click="addToWatchlist(movie)"
              class="watchlist-btn"
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
        class="pagination"
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
  font-size: 2.5rem;
  font-weight: bold;
  background: linear-gradient(45deg, #ff0000, #ff4500);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  text-align: center;
  padding: 1rem;
}

.search-header {
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.8),
    rgba(0, 0, 0, 0.9)
  ) !important;
  border-radius: 16px;
  padding: 1rem;
  margin: 1rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
}

.search-field,
.category-select {
  background-color: #1a1a1a !important;
  border-radius: 12px !important;
  color: #f0f0f0 !important;
}

.series-checkbox {
  color: #ff0000 !important;
  margin-left: 1rem !important;
}

.search-btn {
  border-radius: 25px !important;
  padding: 0 2rem !important;
  font-weight: bold !important;
  box-shadow: 0 4px 12px rgba(255, 0, 0, 0.3) !important;
  transition: all 0.3s ease !important;
  text-transform: none !important;
}

.search-btn:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 6px 20px rgba(255, 0, 0, 0.5) !important;
}

.autocomplete-chips {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
  margin: 1rem 0;
}

.autocomplete-chip {
  border: 2px solid #ff0000 !important;
  transition: all 0.3s ease !important;
  cursor: pointer !important;
}

.autocomplete-chip:hover {
  transform: scale(1.05) !important;
  box-shadow: 0 4px 8px rgba(255, 0, 0, 0.3) !important;
}

.results-grid {
  margin: 2rem;
}

.movie-card {
  border-radius: 12px !important;
  overflow: hidden !important;
  transition: all 0.3s ease !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
  background-color: #000 !important;
  cursor: pointer;
}

.movie-card:hover {
  transform: translateY(-5px) !important;
  box-shadow: 0 12px 40px rgba(255, 0, 0, 0.3) !important;
}

.movie-image {
  transition: transform 0.3s ease !important;
  border-radius: 8px !important;
  height: 250px !important;
}

.movie-image:hover {
  transform: scale(1.05) !important;
}

.movie-title-section {
  color: #f0f0f0 !important;
  font-size: 1.2rem !important;
  font-weight: bold !important;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8) !important;
}

.movie-date {
  color: #e5e5e5 !important;
  font-size: 0.9rem !important;
  margin: 0 !important;
}

.movie-overview {
  color: #f0f0f0 !important;
  line-height: 1.4 !important;
  font-size: 0.9rem !important;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5) !important;
  padding: 0.5rem !important;
}

.movie-actions {
  justify-content: space-around !important;
  padding: 1rem !important;
}

.info-btn,
.watchlist-btn {
  border-radius: 20px !important;
  padding: 0.5rem 1.5rem !important;
  font-weight: bold !important;
  transition: all 0.3s ease !important;
  text-transform: none !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3) !important;
}

.info-btn:hover,
.watchlist-btn:hover {
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 12px rgba(255, 0, 0, 0.4) !important;
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
.v-pagination__item {
  color: #ff0000 !important;
  transition: color 0.3s ease !important;
}
.v-pagination__item--active {
  background-color: #ff0000 !important;
  color: white !important;
}

@media (max-width: 959px) {
  .search-header {
    flex-direction: column !important;
    align-items: center !important;
  }

  .search-field,
  .category-select {
    width: 100% !important;
    max-width: 300px !important;
  }

  .results-grid {
    margin: 1rem !important;
  }

  .movie-card {
    margin-bottom: 1rem !important;
  }

  .page-title {
    font-size: 2rem !important;
  }
}

@media (max-width: 599px) {
  .movie-image {
    height: 200px !important;
  }

  .movie-overview {
    font-size: 0.8rem !important;
  }

  .info-btn,
  .watchlist-btn {
    padding: 0.4rem 1rem !important;
    font-size: 0.9rem !important;
  }
}
</style>
