<template>
  <div>
    <div v-if="isEmpty" class="empty-state">
      <h1 class="empty-title">The Watchlist is Empty!!!</h1>
    </div>
    <div v-else style="margin-top: 100px">
      <v-row v-if="results" class="results-grid">
        <v-col
          v-for="(movie, index) in results"
          :key="index"
          cols="12"
          sm="6"
          md="4"
          lg="3"
        >
          <v-card class="movie-card">
            <v-img
              :src="'https://image.tmdb.org/t/p//w500' + movie.backdrop_path"
              @click="seeInfo(movie)"
              class="movie-image"
            />

            <v-card-title
              class="movie-title-section"
              v-if="movie.isSerie == 'tv'"
            >
              {{ movie.name }}
            </v-card-title>
            <v-card-title class="movie-title-section" v-else>
              {{ movie.title }}
            </v-card-title>
            <v-card-subtitle class="movie-overview">
              {{ movie.overview }}
            </v-card-subtitle>
            <v-card-actions class="movie-actions">
              <v-btn
                class="remove-btn"
                color="red"
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
      this.results = this.results.reverse();
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

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50vh;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.8),
    rgba(0, 0, 0, 0.9)
  );
}

.empty-title {
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
  padding: 0.5rem !important;
}

.movie-overview {
  color: #f0f0f0 !important;
  line-height: 1.4 !important;
  font-size: 0.9rem !important;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5) !important;
  padding: 0.5rem !important;
}

.movie-actions {
  justify-content: center !important;
  padding: 1rem !important;
}

.remove-btn {
  border-radius: 20px !important;
  padding: 0.5rem 1.5rem !important;
  font-weight: bold !important;
  transition: all 0.3s ease !important;
  text-transform: none !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3) !important;
  border: 2px solid #ff0000 !important;
}

.remove-btn:hover {
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 12px rgba(255, 0, 0, 0.4) !important;
  background-color: #ff0000 !important;
  color: white !important;
}

@media (max-width: 959px) {
  .results-grid {
    margin: 1rem !important;
  }

  .movie-card {
    margin-bottom: 1rem !important;
  }

  .empty-title {
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

  .remove-btn {
    padding: 0.4rem 1rem !important;
    font-size: 0.9rem !important;
  }
}
</style>
