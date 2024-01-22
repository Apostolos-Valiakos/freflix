<template>
  <div>
    <div
      class="ml-8 horizontal-scroll"
      @keyup.right="nextPage"
      @keyup.left="prevPage"
      @mousewheel.right="nextPage"
    >
      <v-card-title
        class="font-weight-bold pr-5 ma-0"
        style="color: #e5e5e5; font-size: 27px !important"
      >
        {{ titulo }}
      </v-card-title>

      <v-carousel
        hide-delimiters
        show-arrows-on-hover
        class="movie-grid"
        style="white-space: nowrap; display: inline-block"
        @change="nextPage()"
      >
        <v-carousel-item
          v-for="(el, index) in slider"
          :key="index"
          class="movie"
        >
          <div class="d-flex align-center">
            <v-card
              v-for="(item, index) in items"
              :key="index"
              class="elevation-0"
              color="#e5e5e500"
            >
              <v-img
                v-if="item.poster_path && !isMobile"
                @click="handleclick(item)"
                :src="'https://image.tmdb.org/t/p//w500' + item.poster_path"
                contain
                class="d-flex align-center mx-1 cursor-pointer imgJanela movie-poster"
                @mouseover="item.isActive = true"
                @mouseout="item.isActive = false"
              >
              </v-img>
              <v-img
                v-else
                @click="handleclick(item)"
                :src="'https://image.tmdb.org/t/p/w200' + item.poster_path"
                contain
                class="d-flex align-center mx-1 cursor-pointer imgJanela movie-poster"
                @mouseover="item.isActive = true"
                @mouseout="item.isActive = false"
              >
              </v-img>
            </v-card>
          </div>
        </v-carousel-item>
      </v-carousel>
    </div>
    <v-row justify="center">
      <!-- <v-dialog v-model="dialog" max-width="1000px">
        <v-card v-if="dialogItem">
          <v-img
            :src="'https://image.tmdb.org/t/p//w500' + dialogItem.poster_path"
            max-height="350px"
            contain
          />
          <v-card-title class="text-h5">
            {{ dialogItem.title }}
          </v-card-title>
          <v-chip class="mt-2 mb-0 ml-3" small>
            {{ dialogItem.vote_average }} / 10
          </v-chip>
          <v-chip class="ml-3 mt-2 mb-0" small>
            {{ dialogItem.vote_count }} total reviews
          </v-chip>
          <v-card-text class="mt-4">
            {{ dialogItem.overview }}
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="green darken-1" @click="seeMovie(dialogItem.id)">
              Play
            </v-btn>
            <v-btn color="red darken-1" @click="handleClose"> Close </v-btn>
          </v-card-actions>
          <iframe
            id="iframe"
            v-if="showEmbed"
            :src="embedLink"
            width="1000px"
            height="1000px"
            frameborder="0"
            allowfullscreen
          ></iframe>
          <label class="ml-10 text-h5">Similar Movies</label>
          <v-sheet
            class="d-flex align-content-center flex-wrap bg-surface-variant"
            min-height="200"
          >
            <v-sheet
              v-for="(item, index) in similarMovies"
              :key="index"
              class="ma-2 pa-2"
            >
              <v-card
                class="ma-2 pa-2 mx-auto"
                @click="handleclick(item)"
                v-if="item !== undefined"
                width="200"
                height="300"
              >
                <v-card-text
                  style="
                    text-align: center;
                    justify-content: center;
                    display: flex;
                  "
                  >{{ item.title }}</v-card-text
                >
                <v-img
                  v-if="item.poster_path"
                  contain
                  class="movie-poster"
                  :src="'https://image.tmdb.org/t/p//w500' + item.poster_path"
                  max-width="200"
                  max-height="200"
                />
                <v-sheet
                  v-else
                  max-height="200"
                  width="200"
                  color="grey"
                ></v-sheet>
              </v-card>
            </v-sheet>
          </v-sheet>
        </v-card>
      </v-dialog> -->
    </v-row>
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
      slider: [1, 2, 3],
    };
  },
  mounted() {
    if (this.obras && this.obras.length) this.items = this.obras;
    this.isMobile = screen.width < 450;
  },

  methods: {
    handleClose() {
      this.dialog = false;
      this.embedLink = "";
    },
    async getSimilarMovies(ID) {
      const url =
        "https://api.themoviedb.org/3/movie/" +
        ID +
        "/similar?language=en-US&page=1";
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
    seeMovie(link) {
      this.showEmbed = true;
      this.embedLink = "https://autoembed.to/movie/tmdb/" + link;
    },
    handleclick(item) {
      if (this.type === "movie") {
        this.$router.push({ name: "info", query: { id: item.id } });
      } else {
        this.$router.push({ name: "infoSeries", query: { id: item.id } });
      }
      // this.dialog = true;
      // this.dialogItem = item;
      // this.getSimilarMovies(item.id);
    },
    prevPage() {
      for (let x = 0; x <= 2; x++) {
        this.items.unshift(this.items.pop());
      }
    },
    nextPage() {
      for (let x = 0; x <= this.columns; x++) {
        this.items.push(this.items.shift());
      }
    },
    // prevPageDialogCarousel() {
    //   for (let x = 0; x <= this.columns; x++) {
    //     this.similarMovies.unshift(this.similarMovies.pop());
    //   }
    // },
    // nextPageDialogCarousel() {
    //   for (let x = 0; x <= this.columns; x++) {
    //     this.similarMovies.push(this.similarMovies.shift());
    //   }
    // },
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
.imgJanela {
  padding: 0px 5px 0px 0px;
  border-radius: 5px;
  transition: 0.2s;
}

.imgJanela:hover {
  transform: scale(1.1);
}
</style>
