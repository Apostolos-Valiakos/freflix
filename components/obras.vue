<template>
  <div @keyup.right="nextSlide" @keyup.left="prevSlide">
    <v-card-title class="font-weight-bold pr-5 my-2 title">
      {{ titulo }}
    </v-card-title>

    <v-carousel
      v-model="currentIndex"
      hide-delimiters
      :show-arrows="true"
      height="auto"
      class="carousel"
    >
      <v-carousel-item v-for="(page, index) in pages" :key="index">
        <div class="d-flex justify-center align-center">
          <v-card
            v-for="(item, itemIndex) in page"
            :key="item.id || itemIndex"
            class="movie-card elevation-2 mx-1"
            @mouseover="item.isActive = true"
            @mouseleave="item.isActive = false"
            @click="handleclick(item)"
          >
            <a :href="getItemUrl(item)">
              <v-img
                :src="
                  'https://image.tmdb.org/t/p/w500' + (item.poster_path || '')
                "
                :lazy-src="
                  'https://image.tmdb.org/t/p/w500' + (item.poster_path || '')
                "
                contain
                class="movie-poster"
              ></v-img>
            </a>
          </v-card>
        </div>
      </v-carousel-item>
    </v-carousel>
  </div>
</template>

<script>
export default {
  props: {
    obras: {
      required: true,
      type: Array,
    },
    titulo: {
      required: true,
      type: String,
    },
    type: {
      type: String,
    },
  },
  data() {
    return {
      showEmbed: false,
      isMobile: false,
      embedLink: "",
      similarMovies: [],
      dialogItem: "",
      itemTitle: "",
      itemOverview: "",
      itemID: "",
      itemImg: "",
      dialog: false,
      items: [],
      currentIndex: 0,
      itemsPerPage: 6,
      clicado: 0,
    };
  },
  mounted() {
    if (this.obras && this.obras.length) this.items = this.obras;
    this.isMobile = screen.width < 450;
  },

  methods: {
    getItemUrl(item) {
      let routeName = "";
      if (item.isSerie) {
        routeName = item.isSerie === "movie" ? "info" : "infoSeries";
      } else {
        routeName = this.type === "movie" ? "info" : "infoSeries";
      }
      return `/${routeName}?id=${item.id}`;
    },
    handleClose() {
      this.dialog = false;
      this.embedLink = "";
    },
    async getSimilarMovies(ID) {
      const url =
        "https://api.themoviedb.org/3/movie/" +
        ID +
        "/recommendations?language=en-US&page=1";
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
        .then(async (json) => {
          console.log(json);
          for (let index = 0; index < json.results.length; index++) {
            const element = json.results[index];
            if (element !== undefined) {
              this.similarMovies.push(element);
            }
          }
          this.similarMovies.splice(0, 1);
        })
        .catch((err) => console.error("error:" + err));
    },
    handleclick(item) {
      if (item.isSerie) {
        if (item.isSerie === "movie") {
          this.$router.push({ name: "info", query: { id: item.id } });
        } else if (item.isSerie === "tv") {
          this.$router.push({ name: "infoSeries", query: { id: item.id } });
        }
      } else {
        if (this.type === "movie") {
          this.$router.push({ name: "info", query: { id: item.id } });
        } else {
          this.$router.push({ name: "infoSeries", query: { id: item.id } });
        }
      }
    },
    nextSlide() {
      this.currentIndex = (this.currentIndex + 1) % this.pages.length;
    },
    prevSlide() {
      this.currentIndex =
        (this.currentIndex - 1 + this.pages.length) % this.pages.length;
    },
  },
  computed: {
    columns() {
      return this.$vuetify.breakpoint.xl
        ? 9
        : this.$vuetify.breakpoint.lg
        ? 8
        : this.$vuetify.breakpoint.md
        ? 7
        : 3;
    },
    // Adjust the step value here to change how many items the carousel shifts per slide
    // For example, step: 1 shifts by 1 item (high overlap), step: 2 shifts by 2 items (medium overlap), etc.
    // Ensure step <= columns to maintain overlap; step = columns shows no overlap (full page turns)
    step() {
      return 1; // Change this number to adjust the shift positions
    },
    pages() {
      const numItems = this.items.length;
      if (numItems === 0) return [];
      const chunkSize = this.columns;
      const step = this.step;
      const pages = [];
      // Generate starting indices in multiples of step, up to numItems to ensure cycling coverage
      for (let i = 0; i < numItems; i += step) {
        const page = [];
        for (let j = 0; j < chunkSize; j++) {
          const idx = (i + j) % numItems;
          page.push(this.items[idx]);
        }
        pages.push(page);
      }
      // If the last partial cycle isn't covered (e.g., when numItems % step != 0), add remaining starts
      // This ensures full infinite loop without gaps in possible views
      const generatedStarts = new Set(
        pages.map((p, idx) => (idx * step) % numItems)
      );
      for (let start = 0; start < numItems; start++) {
        if (!generatedStarts.has(start)) {
          const page = [];
          for (let j = 0; j < chunkSize; j++) {
            const idx = (start + j) % numItems;
            page.push(this.items[idx]);
          }
          pages.push(page);
        }
      }
      return pages;
    },
  },
  watch: {
    "$vuetify.breakpoint.name"(newBreakpoint) {
      // Reset index if necessary when breakpoint changes and pages length changes
      if (this.currentIndex >= this.pages.length) {
        this.currentIndex = 0;
      }
    },
  },
};
</script>

<style scoped>
* {
  word-break: normal;
}
.cursor-pointer {
  cursor: pointer;
}
.carousel ::v-deep .v-carousel__controls {
  justify-content: space-between;
}
.movie-card {
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  transform-origin: center;
  border: none;
}
.movie-poster {
  border-radius: 8px;
  margin: 0;
}
.v-carousel-item {
  transition: transform 0.5s ease;
}

.movie-card:hover {
  transform: scale(1.1);
  box-shadow: 0px 10px 20px rgba(0, 0, 0, 0.3);
  z-index: 19999;
}

.expanded-card {
  transform: scale(1.1);
  z-index: 19999;
}

/* Responsive card sizes */
@media (min-width: 1904px) {
  .movie-card {
    min-width: 250px !important;
    max-width: 250px !important;
    height: 375px !important;
  }
}

@media (min-width: 1264px) and (max-width: 1903px) {
  .movie-card {
    min-width: 220px !important;
    max-width: 220px !important;
    height: 330px !important;
  }
}

@media (min-width: 960px) and (max-width: 1263px) {
  .movie-card {
    min-width: 180px !important;
    max-width: 180px !important;
    height: 270px !important;
  }
}

@media (min-width: 600px) and (max-width: 959px) {
  .movie-card {
    min-width: 150px !important;
    max-width: 150px !important;
    height: 225px !important;
  }
}

@media (max-width: 599px) {
  .movie-card {
    min-width: 130px !important;
    max-width: 130px !important;
    height: 195px !important;
  }
  .title {
    font-size: 20px !important;
  }
  .carousel ::v-deep .v-btn {
    margin: 0 8px;
  }
}
</style>
