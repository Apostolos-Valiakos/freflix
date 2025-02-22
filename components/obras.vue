<template>
  <div>
    <div class="ml-8" @keyup.right="nextPage" @keyup.left="prevPage">
      <v-card-title
        class="font-weight-bold pr-5 ma-0"
        style="color: #e5e5e5; font-size: 27px !important"
      >
        {{ titulo }}
      </v-card-title>

      <v-carousel
        hide-delimiters
        show-arrows-on-hover
        style="white-space: nowrap; display: inline-block; overflow: hidden"
        class="carousel"
      >
        <template v-slot:prev="{ on, attrs }">
          <v-btn icon v-bind="attrs" v-on="on" @click="prevPage">
            <v-icon>mdi-chevron-left</v-icon>
          </v-btn>
        </template>
        <template v-slot:next="{ on, attrs }">
          <v-btn icon v-bind="attrs" v-on="on" @click="nextPage">
            <v-icon>mdi-chevron-right</v-icon>
          </v-btn>
        </template>
        <v-carousel-item
          v-for="(el, index) in slider"
          :key="index"
          class="movie"
        >
          <div class="d-flex align-center">
            <v-card
              v-for="(item, index) in items"
              :key="index"
              class="movie-card elevation-2 mx-1"
              @mouseover="item.isActive = true"
              @mouseleave="item.isActive = false"
              @click="handleclick(item)"
              style="
                min-width: 250px;
                max-width: 250px;
                transition: transform 0.3s;
                overflow: hidden;
                border: none;
              "
            >
              <a :href="getItemUrl(item.id)">
                <v-img
                  style="
                    min-width: 250px;
                    max-width: 250px;
                    transition: transform 0.3s;
                    overflow: hidden;
                    border: none;
                  "
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
      slider: [1, 2, 3, 4],
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
      return "/" + routeName + "?id=" + item;
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
    prevPage() {
      for (let x = 0; x <= this.columns; x++) {
        this.items.unshift(this.items.pop());
      }
    },
    nextPage() {
      for (let x = 0; x <= this.columns; x++) {
        this.items.push(this.items.shift());
      }
    },
  },
  computed: {
    columns() {
      if (this.$vuetify.breakpoint.xl) {
        return 4;
      }

      if (this.$vuetify.breakpoint.lg) {
        return 3;
      }

      if (this.$vuetify.breakpoint.md) {
        return 2;
      }

      return 1;
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
.carousel {
  overflow-x: auto;
}
.movie-card {
  border-radius: 8px;
  overflow: hidden;
}
.movie-poster {
  border-radius: 8px;
  margin: 0; /* Remove margin to eliminate black space */
}
.v-carousel-item {
  transition: transform 0.5s ease; /* Transition for smooth animation */
}
</style>
