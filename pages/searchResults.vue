<template>
  <div :style="marginFromTop">
    <div class="search-header">
      <div
        class="search-inputs d-flex flex-wrap justify-space-between align-center"
      >
        <v-text-field
          color="red"
          class="ma-2 pa-4 search-field flex-grow-1"
          label="Search by Name"
          v-model="searchTerm"
          @change="onTermChange"
          clearable
          dense
          hide-details
        />
      </div>

      <v-expansion-panels class="mt-4 mb-2" dark>
        <v-expansion-panel style="background-color: #1a1a1a">
          <v-expansion-panel-header class="white--text font-weight-bold">
            <template v-slot:default="{ open }">
              <v-row no-gutters>
                <v-col cols="4" class="d-flex align-center">
                  <v-icon :color="open ? 'red' : 'white'" left
                    >mdi-filter-variant</v-icon
                  >
                  Advanced Filters
                </v-col>
                <v-col cols="8" class="text--secondary">
                  <v-fade-transition leave-absolute>
                    <span v-if="open" key="0"
                      >Select categories, years, and ratings</span
                    >
                    <span v-else key="1">
                      {{ activeFilterSummary }}
                    </span>
                  </v-fade-transition>
                </v-col>
              </v-row>
            </template>
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <v-row>
              <v-col cols="12" md="3">
                <v-select
                  v-model="filters.sortBy"
                  :items="sortOptions"
                  label="Sort By"
                  item-text="label"
                  item-value="value"
                  dense
                  outlined
                  color="red"
                  item-color="red"
                  background-color="black"
                  dark
                ></v-select>
              </v-col>

              <v-col cols="12" md="3">
                <v-select
                  color="red"
                  background-color="black"
                  dark
                  outlined
                  dense
                  v-if="categoryItems.length"
                  :item-text="'name'"
                  :item-value="'id'"
                  v-model="filters.selectedGenre"
                  label="Genre"
                  :items="categoryItems"
                  clearable
                />
              </v-col>

              <v-col cols="12" md="3">
                <div class="text-caption grey--text mb-2">
                  Year: {{ filters.yearRange[0] }} - {{ filters.yearRange[1] }}
                </div>
                <v-range-slider
                  v-model="filters.yearRange"
                  :min="1950"
                  :max="2030"
                  thumb-label
                  color="red"
                  track-color="grey darken-2"
                  dense
                ></v-range-slider>
              </v-col>

              <v-col cols="12" md="3">
                <div class="text-caption grey--text mb-2">
                  Min Rating: {{ filters.minRating }}+
                </div>
                <v-slider
                  v-model="filters.minRating"
                  min="0"
                  max="10"
                  step="0.5"
                  thumb-label
                  color="yellow darken-2"
                  track-color="grey darken-2"
                  dense
                >
                  <template v-slot:append>
                    <v-icon color="yellow darken-2">mdi-star</v-icon>
                  </template>
                </v-slider>
              </v-col>
            </v-row>
            <v-row class="justify-end">
              <v-btn text color="grey" @click="resetFilters">Reset</v-btn>
              <v-btn color="red" @click="applyFilters">Apply Filters</v-btn>
            </v-row>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>

      <div class="search-actions d-flex justify-center mt-2">
        <v-btn class="search-btn" @click="onSearchClick" color="red" large>
          <v-icon left>mdi-magnify</v-icon>
          Search
        </v-btn>
      </div>
    </div>

    <h2 class="page-title" v-if="isFiltering">Filtered Results</h2>
    <h2 class="page-title" v-else-if="searchTerm">
      Search Results for "{{ searchTerm }}"
    </h2>
    <h2 class="page-title" v-else>Popular Movies & Series</h2>

    <div class="autocomplete-chips" v-if="autocompleteItems.length > 0">
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
        :key="index + '-' + movie.id"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <v-card class="mb-4 movie-card">
          <v-img
            @click="seeInfo(movie)"
            :src="
              movie.backdrop_path
                ? 'https://image.tmdb.org/t/p/w500' + movie.backdrop_path
                : 'https://via.placeholder.com/500x281?text=No+Image'
            "
            class="movie-image"
          >
            <template v-slot:placeholder>
              <v-row class="fill-height ma-0" align="center" justify="center">
                <v-progress-circular
                  indeterminate
                  color="red"
                ></v-progress-circular>
              </v-row>
            </template>
          </v-img>

          <v-card-title class="movie-title-section text-truncate d-block">
            {{ movie.name || movie.title }}
          </v-card-title>

          <v-card-subtitle class="d-flex align-center pt-2">
            <span
              class="movie-date mr-2"
              v-if="movie.first_air_date || movie.release_date"
            >
              {{ (movie.first_air_date || movie.release_date).substring(0, 4) }}
            </span>
            <v-chip x-small color="red" outlined v-if="movie.vote_average">
              {{ movie.vote_average.toFixed(1) }}
            </v-chip>
            <v-spacer></v-spacer>
            <v-chip x-small color="grey darken-3" class="white--text">
              {{ movie.isSerie === "tv" ? "TV" : "Movie" }}
            </v-chip>
          </v-card-subtitle>

          <v-card-actions class="movie-actions">
            <v-btn text @click="seeInfo(movie)" class="info-btn" color="red">
              Info
            </v-btn>
            <v-btn icon @click="addToWatchlist(movie)" color="white">
              <v-icon>mdi-plus</v-icon>
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
      page: 1,
      loading: false,
      autocompleteItems: [],
      categories: [],
      seriesCategories: [],
      noOfPages: 0,
      searchTerm: "",
      searchResults: [],
      observer: null,
      useKeywordSearch: false,
      keywordId: "",
      isFiltering: false, // State to track if we are using advanced filters

      // Advanced Filters State
      filters: {
        sortBy: "popularity.desc",
        yearRange: [1980, 2026],
        minRating: 0,
        selectedGenre: null,
      },
      sortOptions: [
        { label: "Popularity Descending", value: "popularity.desc" },
        { label: "Popularity Ascending", value: "popularity.asc" },
        { label: "Rating Descending", value: "vote_average.desc" },
        { label: "Rating Ascending", value: "vote_average.asc" },
        {
          label: "Release Date Descending",
          value: "primary_release_date.desc",
        },
        { label: "Release Date Ascending", value: "primary_release_date.asc" },
      ],
    };
  },
  computed: {
    categoryItems() {
      // Merge Movie and TV categories
      const combined = [...this.categories, ...this.seriesCategories];
      // Deduplicate by ID and Name
      const unique = [];
      const map = new Map();
      for (const item of combined) {
        if (!map.has(item.id)) {
          map.set(item.id, true);
          unique.push(item);
        }
      }
      return unique.sort((a, b) => a.name.localeCompare(b.name));
    },
    activeFilterSummary() {
      if (this.isFiltering) return "Filters Active";
      return "Category, Year, Rating...";
    },
  },
  methods: {
    resetFilters() {
      this.filters = {
        sortBy: "popularity.desc",
        yearRange: [1980, 2026],
        minRating: 0,
        selectedGenre: null,
      };
      this.searchTerm = "";
      this.isFiltering = false;
      this.searchPerCategory("", 1); // Reset to default popular
    },
    applyFilters() {
      this.searchTerm = ""; // Clear text search when filtering
      this.useKeywordSearch = false;
      this.isFiltering = true;
      this.page = 1;
      this.searchResults = []; // Clear current results
      this.searchWithFilters(1);
    },
    onTermChange() {
      this.isFiltering = false; // Disable advanced filter mode
      this.useKeywordSearch = false;
      this.keywordId = "";
      this.filters.selectedGenre = null; // Reset genre
      this.search(1);
    },
    onSearchClick() {
      if (this.isFiltering) {
        this.applyFilters();
      } else {
        this.onTermChange();
      }
    },

    // --- API & SEARCH LOGIC ---

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

      const sortVal = this.filters.sortBy;
      return results.sort((a, b) => {
        if (sortVal.includes("vote_average")) {
          return sortVal.includes("desc")
            ? b.vote_average - a.vote_average
            : a.vote_average - b.vote_average;
        } else if (sortVal.includes("primary_release_date")) {
          // Robust date handling
          const dateA = new Date(
            a.release_date || a.first_air_date || "1900-01-01"
          );
          const dateB = new Date(
            b.release_date || b.first_air_date || "1900-01-01"
          );
          return sortVal.includes("desc") ? dateB - dateA : dateA - dateB;
        }
        return sortVal.includes("asc")
          ? a.popularity - b.popularity
          : b.popularity - a.popularity;
      });
    },

    async searchWithFilters(page) {
      // This uses the /discover endpoint to support advanced filters
      const baseUrl = `https://api.themoviedb.org/3/discover`;

      // Common Params
      let params = `include_adult=false&include_video=false&language=en-US&page=${page}`;
      params += `&sort_by=${this.filters.sortBy}`;
      params += `&vote_average.gte=${this.filters.minRating}`;

      // Handle Genres
      if (this.filters.selectedGenre) {
        params += `&with_genres=${this.filters.selectedGenre}`;
      }

      // Handle Years (Movie vs TV params differ)
      // Movie: primary_release_date.gte
      // TV: first_air_date.gte
      const minDate = `${this.filters.yearRange[0]}-01-01`;
      const maxDate = `${this.filters.yearRange[1]}-12-31`;

      const movieParams = `${params}&primary_release_date.gte=${minDate}&primary_release_date.lte=${maxDate}`;
      const tvParams = `${params}&first_air_date.gte=${minDate}&first_air_date.lte=${maxDate}`;

      const options = this.getApiOptions();

      try {
        const [movieRes, tvRes] = await Promise.all([
          fetch(`${baseUrl}/movie?${movieParams}`, options),
          fetch(`${baseUrl}/tv?${tvParams}`, options),
        ]);

        const movieJson = await movieRes.json();
        const tvJson = await tvRes.json();

        const merged = this.mergeResults(movieJson, tvJson);
        this.noOfPages = Math.max(
          movieJson.total_pages || 0,
          tvJson.total_pages || 0
        );

        if (page === 1) {
          this.searchResults = merged;
        } else {
          this.searchResults.push(...merged);
        }
      } catch (e) {
        console.error("Filter Search Error", e);
      }
    },

    async search(page) {
      this.isFiltering = false;
      const isNew = page === 1;
      if (isNew) this.searchResults = [];

      const url = `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(
        this.searchTerm
      )}&include_adult=false&language=en-US&page=${page}`;

      try {
        const res = await fetch(url, this.getApiOptions());
        const json = await res.json();
        this.noOfPages = Math.min(json.total_pages || 0, 50); // Cap at 50 for performance
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
        console.error(error);
      }
      if (isNew) this.autocomplete();
    },

    async searchByKeyword(keywordId, page) {
      const isNew = page === 1;
      if (isNew) this.searchResults = [];
      this.loading = true;

      const options = this.getApiOptions();
      const movieUrl = `https://api.themoviedb.org/3/discover/movie?include_adult=false&language=en-US&page=${page}&sort_by=popularity.desc&with_keywords=${keywordId}`;
      const tvUrl = `https://api.themoviedb.org/3/discover/tv?include_adult=false&language=en-US&page=${page}&sort_by=popularity.desc&with_keywords=${keywordId}`;

      try {
        const [movieRes, tvRes] = await Promise.all([
          fetch(movieUrl, options),
          fetch(tvUrl, options),
        ]);

        // Corrected JSON extraction
        const movieJson = await movieRes.json();
        const tvJson = await tvRes.json();

        const merged = this.mergeResults(movieJson, tvJson);
        this.noOfPages = Math.max(
          movieJson.total_pages || 0,
          tvJson.total_pages || 0
        );

        if (isNew) this.searchResults = merged;
        else this.searchResults.push(...merged);
      } catch (e) {
        console.error("Keyword Search Error:", e);
      } finally {
        this.loading = false;
      }
    },

    // Legacy method kept for "popular" init
    async searchPerCategory(genreName, page) {
      // If we are just loading initial "Popular" (empty genre), treat as filtered search with defaults
      if (genreName === "") {
        this.filters.selectedGenre = null;
        await this.searchWithFilters(page);
        return;
      }
      // If a specific genre was passed (from older logic), set it in filter and run
      const genreObj = this.categoryItems.find((c) => c.name === genreName);
      if (genreObj) {
        this.filters.selectedGenre = genreObj.id;
        this.isFiltering = true;
        await this.searchWithFilters(page);
      }
    },

    async searchFromChip(item) {
      this.searchTerm = item.name;
      this.filters.selectedGenre = null;
      this.keywordId = item.id;
      this.useKeywordSearch = true;
      this.isFiltering = false;
      await this.searchByKeyword(item.id, 1);
      this.autocomplete();
    },

    // --- UTILS ---
    getApiOptions() {
      return {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization:
            "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwYjE5NTM3NWNkODk0ZGRlNzkwOGNiNzIxMmQwMTBmOCIsInN1YiI6IjY1ODdmNjU1MmRmZmQ4NWNkYjQ0ZDkwNiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.XaBBhvFBh29o9x62S5G3BJ-KVofB-_clblrCU7PUj7M",
        },
      };
    },

    autocomplete() {
      if (!this.searchTerm) return;
      const url = `https://api.themoviedb.org/3/search/keyword?query=${this.searchTerm}&page=1`;
      fetch(url, this.getApiOptions())
        .then((res) => res.json())
        .then((json) => {
          this.autocompleteItems = json.results;
        })
        .catch((err) => console.error(err));
    },

    seeInfo(movie) {
      const name = movie.isSerie === "tv" ? "infoSeries" : "info";
      this.$router.push({ name, query: { id: movie.id } });
    },

    addToWatchlist(movie) {
      let watchlist = JSON.parse(localStorage.getItem("watchlist") || "[]");
      const index = watchlist.findIndex(
        (item) => item.id === movie.id && item.isSerie === movie.isSerie
      );
      if (index === -1) {
        watchlist.unshift(movie);
      } else {
        watchlist.splice(index, 1); // remove if exists (toggle) or move to top? Logic implies toggle usually or re-add
        watchlist.unshift(movie);
      }
      localStorage.setItem("watchlist", JSON.stringify(watchlist));
    },

    loadNextPage() {
      this.loading = true;
      this.page++;
      let promise;

      if (this.isFiltering) {
        promise = this.searchWithFilters(this.page);
      } else if (this.useKeywordSearch) {
        promise = this.searchByKeyword(this.keywordId, this.page);
      } else if (this.searchTerm) {
        promise = this.search(this.page);
      } else {
        // Default fallback
        promise = this.searchWithFilters(this.page);
      }

      promise
        .then(() => {
          this.loading = false;
        })
        .catch(() => {
          this.loading = false;
          this.page--;
        });
    },

    setupInfiniteScroll() {
      this.observer = new IntersectionObserver(
        (entries) => {
          if (
            entries[0].isIntersecting &&
            this.page < this.noOfPages &&
            !this.loading
          ) {
            this.loadNextPage();
          }
        },
        { threshold: 0 }
      );
    },

    getCategories() {
      fetch(
        "https://api.themoviedb.org/3/genre/movie/list?language=en",
        this.getApiOptions()
      )
        .then((res) => res.json())
        .then((json) => (this.categories = json.genres));
    },
    getSeriesCategories() {
      fetch(
        "https://api.themoviedb.org/3/genre/tv/list?language=en",
        this.getApiOptions()
      )
        .then((res) => res.json())
        .then((json) => (this.seriesCategories = json.genres));
    },
  },

  created() {
    this.getCategories();
    this.getSeriesCategories();
    if (screen.width < 450) {
      this.marginFromTop = "margin-top: 0px";
    }
    // Load default popular
    this.searchWithFilters(1);
  },
  mounted() {
    this.$nextTick(() => {
      // Ensure the element actually exists before observing
      const target = this.$refs.sentinel;
      if (target) {
        this.setupInfiniteScroll();
        this.observer.observe(target);
      }
    });
  },
};
</script>

<style scoped>
/* Page & Header */
.page-title {
  margin-top: 30px;
  margin-bottom: 20px;
  font-size: 2.5rem;
  font-weight: bold;
  background: linear-gradient(45deg, #ff0000, #ff4500);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-align: center;
  padding: 1rem;
}

.search-header {
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 1));
  border-radius: 16px;
  padding: 1.5rem;
  margin: 1rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  border: 1px solid #333;
}

/* Inputs */
.search-field ::v-deep .v-input__slot,
.v-select ::v-deep .v-input__slot {
  border-radius: 8px !important;
}

.search-btn {
  border-radius: 25px !important;
  font-weight: bold !important;
  text-transform: none !important;
  padding: 0 30px !important;
}

/* Cards */
.results-grid {
  margin: 2rem;
}
.movie-card {
  border-radius: 12px !important;
  background-color: #111 !important;
  transition: transform 0.2s;
  cursor: pointer;
}
.movie-card:hover {
  transform: scale(1.02);
  z-index: 2;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.5);
}
.movie-image {
  height: 200px;
  border-radius: 12px 12px 0 0;
}
.movie-title-section {
  color: white !important;
  font-size: 1.1rem;
  font-weight: bold;
}

/* Mobile */
@media (max-width: 600px) {
  .results-grid {
    margin: 0.5rem;
  }
  .page-title {
    font-size: 1.8rem;
  }
  .search-header {
    padding: 1rem;
    margin: 0.5rem;
  }
}
</style>
