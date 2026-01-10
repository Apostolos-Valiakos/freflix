<template>
  <div :style="marginFromTop">
    <div class="search-header">
      <div
        class="search-inputs d-flex flex-wrap justify-space-between align-center"
      >
        <v-text-field
          color="red"
          class="ma-2 pa-4 search-field flex-grow-1"
          label="Search"
          v-model="searchTerm"
          @change="onTermChange"
          clearable
          dense
        />
        <v-select
          color="red"
          class="ma-2 pa-4 category-select flex-grow-1"
          v-if="categoryItems.length"
          @change="onCategoryChange"
          :item-text="'name'"
          :item-value="'name'"
          v-model="selectedCategory"
          label="Search by Category"
          :items="categoryItems"
          dense
        />
      </div>
      <div class="search-actions d-flex justify-center mt-4">
        <v-btn class="search-btn" @click="onSearchClick" color="red" large>
          <v-icon left>mdi-magnify</v-icon>
          Search
        </v-btn>
      </div>
    </div>

    <h2 class="page-title" v-if="searchTerm">
      Search Results for "{{ searchTerm }}"
    </h2>
    <h2 class="page-title" v-else-if="selectedCategory">
      Movies & Series in "{{ selectedCategory }}"
    </h2>
    <h2 class="page-title" v-else>Popular Movies & Series</h2>
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
            @click="seeInfo(movie)"
            :src="'https://image.tmdb.org/t/p//w500' + movie.backdrop_path"
            class="movie-image"
          />
          <v-card-title class="movie-title-section">
            {{ movie.name || movie.title }}
            <h5 class="movie-date ms-1">
              ({{ movie.first_air_date || movie.release_date }})
            </h5>
          </v-card-title>
          <v-card-subtitle class="movie-overview">
            {{ movie.overview }}
          </v-card-subtitle>
          <v-card-actions class="movie-actions">
            <v-btn
              color="white"
              @click="seeInfo(movie)"
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
    <div ref="sentinel" class="sentinel pa-4 text-center">
      <v-progress-circular v-if="loading" indeterminate color="red" />
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
      loading: false,
      autocompleteItems: [],
      embedLink: "",
      selectedCategory: "",
      categories: [],
      seriesCategories: [],
      noOfPages: 0,
      searchTerm: "",
      searchResults: [],
      observer: null,
      useKeywordSearch: false,
      keywordId: "",
    };
  },
  computed: {
    categoryItems() {
      const names = new Set();
      this.categories.forEach((c) => names.add(c.name));
      this.seriesCategories.forEach((c) => names.add(c.name));
      return Array.from(names).sort();
    },
  },
  methods: {
    onTermChange() {
      this.selectedCategory = "";
      this.useKeywordSearch = false;
      this.keywordId = "";
      this.search(1);
    },
    onCategoryChange() {
      this.searchTerm = "";
      this.useKeywordSearch = false;
      this.keywordId = "";
      this.searchPerCategory(this.selectedCategory, 1);
    },
    onSearchClick() {
      this.onTermChange();
    },
    mergeResults(movieJson, tvJson) {
      const results = [];
      if (movieJson?.results) {
        results.push(
          ...movieJson.results.map((item) => ({ ...item, isSerie: "movie" }))
        );
      }
      if (tvJson?.results) {
        results.push(
          ...tvJson.results.map((item) => ({ ...item, isSerie: "tv" }))
        );
      }
      return results.sort((a, b) => b.popularity - a.popularity);
    },
    async search(page) {
      this.useKeywordSearch = false;
      this.keywordId = "";
      const isNew = page === 1;
      if (isNew) {
        this.searchResults = [];
      }
      const url = `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(
        this.searchTerm
      )}&include_adult=false&language=en-US&page=${page}`;
      const options = {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization:
            "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwYjE5NTM3NWNkODk0ZGRlNzkwOGNiNzIxMmQwMTBmOCIsInN1YiI6IjY1ODdmNjU1MmRmZmQ4NWNkYjQ0ZDkwNiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.XaBBhvFBh29o9x62S5G3BJ-KVofB-_clblrCU7PUj7M",
        },
      };

      try {
        const res = await fetch(url, options);
        const json = await res.json();
        this.noOfPages = Math.min(json.total_pages || 0, 50);
        let results = (json.results || [])
          .filter((r) => r.media_type !== "person")
          .map((r) => ({
            ...r,
            isSerie: r.media_type === "tv" ? "tv" : "movie",
          }));
        if (isNew) {
          this.searchResults = results;
        } else {
          this.searchResults.push(...results);
        }
      } catch (error) {
        console.error("error:" + error);
        alert("Error fetching search results:", error);
      }
      this.autocomplete();
      this.saveFilters();
    },
    async searchByKeyword(keywordId, page) {
      const isNew = page === 1;
      if (isNew) {
        this.searchResults = [];
      }
      const baseOptions = {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization:
            "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwYjE5NTM3NWNkODk0ZGRlNzkwOGNiNzIxMmQwMTBmOCIsInN1YiI6IjY1ODdmNjU1MmRmZmQ4NWNkYjQ0ZDkwNiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.XaBBhvFBh29o9x62S5G3BJ-KVofB-_clblrCU7PUj7M",
        },
      };
      const movieUrl = `https://api.themoviedb.org/3/discover/movie?include_adult=false&language=en-US&page=${page}&sort_by=popularity.desc&with_keywords=${keywordId}`;
      const tvUrl = `https://api.themoviedb.org/3/discover/tv?include_adult=false&include_video=false&language=en-US&page=${page}&sort_by=popularity.desc&with_keywords=${keywordId}`;
      const [movieRes, tvRes] = await Promise.all([
        fetch(movieUrl, baseOptions),
        fetch(tvUrl, baseOptions),
      ]);
      const [movieJson, tvJson] = await Promise.all([
        movieRes.json(),
        tvRes.json(),
      ]);
      const merged = this.mergeResults(movieJson, tvJson);
      this.noOfPages = Math.max(
        movieJson.total_pages || 0,
        tvJson.total_pages || 0
      );
      if (isNew) {
        this.searchResults = merged;
      } else {
        this.searchResults.push(...merged);
      }
      this.autocomplete();
      this.saveFilters();
    },
    async searchPerCategory(genreName, page) {
      this.useKeywordSearch = false;
      this.keywordId = "";
      const isNew = page === 1;
      if (isNew) {
        this.searchResults = [];
      }
      const baseUrl = `https://api.themoviedb.org/3/discover`;
      const baseParams = `include_adult=false&include_video=false&language=en-US&page=${page}&sort_by=popularity.desc`;
      const baseOptions = {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization:
            "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwYjE5NTM3NWNkODk0ZGRlNzkwOGNiNzIxMmQwMTBmOCIsInN1YiI6IjY1ODdmNjU1MmRmZmQ4NWNkYjQ0ZDkwNiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.XaBBhvFBh29o9x62S5G3BJ-KVofB-_clblrCU7PUj7M",
        },
      };
      let movieJson = null;
      let tvJson = null;
      if (genreName === "") {
        // Popular (no genre)
        const [movieRes, tvRes] = await Promise.all([
          fetch(`${baseUrl}/movie?${baseParams}`, baseOptions),
          fetch(`${baseUrl}/tv?${baseParams}`, baseOptions),
        ]);
        movieJson = await movieRes.json();
        tvJson = await tvRes.json();
      } else {
        const movieGenreId = this.categories.find(
          (c) => c.name === genreName
        )?.id;
        const tvGenreId = this.seriesCategories.find(
          (c) => c.name === genreName
        )?.id;
        const moviePromises = [];
        const tvPromises = [];
        if (movieGenreId !== undefined) {
          moviePromises.push(
            fetch(
              `${baseUrl}/movie?${baseParams}&with_genres=${movieGenreId}`,
              baseOptions
            ).then((res) => res.json())
          );
        }
        if (tvGenreId !== undefined) {
          tvPromises.push(
            fetch(
              `${baseUrl}/tv?${baseParams}&with_genres=${tvGenreId}`,
              baseOptions
            ).then((res) => res.json())
          );
        }
        if (moviePromises.length) {
          movieJson = await moviePromises[0];
        }
        if (tvPromises.length) {
          tvJson = await tvPromises[0];
        }
      }
      const merged = this.mergeResults(movieJson, tvJson);
      this.noOfPages = Math.max(
        movieJson?.total_pages || 0,
        tvJson?.total_pages || 0
      );
      if (isNew) {
        this.searchResults = merged;
      } else {
        this.searchResults.push(...merged);
      }
      this.saveFilters();
    },
    async searchFromChip(item) {
      this.searchTerm = item.name;
      this.selectedCategory = "";
      this.keywordId = item.id;
      this.useKeywordSearch = true;
      await this.searchByKeyword(item.id, 1);
      this.autocomplete();
      this.saveFilters();
    },
    autocomplete() {
      if (!this.searchTerm) return;
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
    addToWatchlist(movie) {
      // isSerie already set during fetch
      var watchlistFromLocalStorage = JSON.parse(
        localStorage.getItem("watchlist") || "[]"
      );

      var movieIndex = watchlistFromLocalStorage.findIndex(
        (item) => item.id === movie.id && item.isSerie === movie.isSerie
      );

      if (movieIndex === -1) {
        watchlistFromLocalStorage.push(movie);
      } else {
        watchlistFromLocalStorage.splice(movieIndex, 1);
        watchlistFromLocalStorage.unshift(movie);
      }

      localStorage.setItem(
        "watchlist",
        JSON.stringify(watchlistFromLocalStorage)
      );
    },
    seeMovie(link) {
      if (this.isSerie) {
        location.href =
          "https://multiembed.mov/?video_id=" + link + "&tmdb=1&s=1&e=1";
      } else {
        location.href = "https://multiembed.mov/?video_id=" + link + "&tmdb=1";
      }
    },
    loadNextPage() {
      this.loading = true;
      this.page++;
      let promise;
      if (this.searchTerm) {
        if (this.useKeywordSearch) {
          promise = this.searchByKeyword(this.keywordId, this.page);
        } else {
          promise = this.search(this.page);
        }
      } else {
        promise = this.searchPerCategory(
          this.selectedCategory || "",
          this.page
        );
      }
      promise
        .then(() => {
          this.loading = false;
        })
        .catch((err) => {
          console.error(err);
          this.loading = false;
          this.page--;
        });
    },
    setupInfiniteScroll() {
      this.observer = new IntersectionObserver(
        (entries) => {
          const target = entries[0];
          if (
            target.isIntersecting &&
            this.page < this.noOfPages &&
            !this.loading
          ) {
            this.loadNextPage();
          }
        },
        { threshold: 0 }
      );
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
    saveFilters() {
      const filters = {
        searchTerm: this.searchTerm,
        selectedCategory: this.selectedCategory,
        useKeywordSearch: this.useKeywordSearch,
        keywordId: this.keywordId,
      };
      localStorage.setItem("searchFilters", JSON.stringify(filters));
    },
    loadFilters() {
      const filtersFromLocalStorage = JSON.parse(
        localStorage.getItem("searchFilters") || "{}"
      );
      if (filtersFromLocalStorage.hasOwnProperty("searchTerm")) {
        this.searchTerm = filtersFromLocalStorage.searchTerm;
      }
      if (filtersFromLocalStorage.hasOwnProperty("selectedCategory")) {
        this.selectedCategory = filtersFromLocalStorage.selectedCategory;
      }
      if (filtersFromLocalStorage.hasOwnProperty("useKeywordSearch")) {
        this.useKeywordSearch = filtersFromLocalStorage.useKeywordSearch;
      }
      if (filtersFromLocalStorage.hasOwnProperty("keywordId")) {
        this.keywordId = filtersFromLocalStorage.keywordId;
      }
    },
  },
  async created() {
    this.loadFilters();
    this.getCategories();
    this.getSeriesCategories();
    if (screen.width < 450) {
      this.marginFromTop = "margin-top: 0px";
    }
    const initialPage = 1;
    if (this.useKeywordSearch && this.keywordId) {
      await this.searchByKeyword(this.keywordId, initialPage);
    } else if (this.searchTerm) {
      await this.search(initialPage);
    } else if (this.selectedCategory) {
      await this.searchPerCategory(this.selectedCategory, initialPage);
    } else {
      await this.searchPerCategory("", initialPage);
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.setupInfiniteScroll();
      if (this.$refs.sentinel) {
        this.observer.observe(this.$refs.sentinel);
      }
    });
  },
  beforeDestroy() {
    if (this.observer) {
      this.observer.disconnect();
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
  padding: 1.5rem;
  margin: 1rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
}

.search-inputs {
  max-width: 1200px;
  margin: 0 auto;
}

.search-field,
.category-select {
  background-color: #1a1a1a !important;
  border-radius: 12px !important;
  color: #f0f0f0 !important;
}

.search-field ::v-deep .v-input__slot {
  background-color: #1a1a1a !important;
  border-radius: 12px !important;
  color: #f0f0f0 !important;
}

.search-field ::v-deep .v-list-item {
  background-color: #2a2a2a !important;
  color: white !important;
}

.search-field ::v-deep .v-list-item:hover {
  background-color: #ff0000 !important;
}

.search-actions {
  max-width: 1200px;
  margin: 0 auto;
}

.search-btn {
  border-radius: 25px !important;
  padding: 0 2rem !important;
  font-weight: bold !important;
  box-shadow: 0 4px 12px rgba(255, 0, 0, 0.3) !important;
  transition: all 0.3s ease !important;
  text-transform: none !important;
  min-width: 120px !important;
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

.sentinel {
  min-height: 20px;
}

@media (max-width: 959px) {
  .search-header {
    flex-direction: column !important;
    align-items: center !important;
    padding: 1rem !important;
  }

  .search-inputs {
    flex-direction: column !important;
    width: 100% !important;
  }

  .search-field,
  .category-select {
    width: 100% !important;
    max-width: none !important;
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

  .search-btn {
    width: 100% !important;
  }
}
</style>
