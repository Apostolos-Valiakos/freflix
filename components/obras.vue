<template>
  <div>
    <div
      class="ml-16 horizontal-scroll"
      @keyup.right="nextPage"
      @keyup.left="prevPage"
      @mousewheel.right="nextPage"
    >
      <v-card-title
        class="font-weight-bold pr-5 ma-0"
        style="color: #e5e5e5; font-size: 27px !important"
        >{{ titulo }}</v-card-title
      >
      <v-carousel
        show-arrows-on-hover
        hide-delimiters
        :height="220"
        style="white-space: nowrap; display: inline-block"
        @change="nextPage()"
      >
        <v-carousel-item v-for="(el, index) in slider" :key="index">
          <div
            class="d-flex align-center pa-0 ma-0"
            style="white-space: nowrap; display: inline-block"
          >
            <v-card
              v-for="(item, index) in items"
              :key="index"
              class="elevation-0 pa-0 ma-0"
              color="#e5e5e500"
            >
              <v-img
                v-if="item.image"
                @click="handleclick(item)"
                :src="item.image"
                height="200"
                width="285"
                contain
                class="d-flex align-center mx-1 cursor-pointer imgJanela"
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
      <v-dialog v-model="dialog" persistent max-width="600">
        <v-card>
          <v-img :src="itemImg" />
          <v-card-title class="text-h5">
            {{ itemTitle }}
          </v-card-title>
          <v-card-text>
            {{ itemOverview }}
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="green darken-1" @click="seeMovie(itemID)">
              Play
            </v-btn>
            <v-btn color="red darken-1" @click="dialog = false"> Close </v-btn>
          </v-card-actions>
          <v-carousel
            show-arrows-on-hover
            hide-delimiters
            :height="220"
            style="white-space: nowrap; display: inline-block"
          >
            <v-carousel-item v-for="(el, index) in slider" :key="index">
              <div
                class="d-flex align-center pa-0 ma-0"
                style="white-space: nowrap; display: inline-block"
              >
                <v-card
                  v-for="(item, index) in similarMovies"
                  :key="index"
                  class="elevation-0 pa-0 ma-0"
                  color="#e5e5e500"
                >
                  <v-img
                    v-if="item.poster_path"
                    @click="handleclick(item)"
                    :src="'https://image.tmdb.org/t/p//w500' + item.poster_path"
                    height="200"
                    width="285"
                    contain
                    class="d-flex align-center mx-1 cursor-pointer imgJanela"
                    @mouseover="item.isActive = true"
                    @mouseout="item.isActive = false"
                  >
                  </v-img>
                </v-card>
              </div>
            </v-carousel-item>
          </v-carousel>
        </v-card>
      </v-dialog>
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
  },
  data() {
    return {
      similarMovies: [],
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
  },
  methods: {
    getSimilarMovies(ID) {
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

      fetch(url, options)
        .then((res) => res.json())
        .then((json) => {
          console.log(json.results);
          this.similarMovies = json.results;
        })
        .catch((err) => console.error("error:" + err));
    },
    seeMovie(link) {
      location.href = "https://vidsrc.xyz/embed/movie?tmdb=" + link;
    },
    handleclick(item) {
      this.dialog = true;
      this.itemTitle = item.title;
      this.itemOverview = item.overview;
      this.itemID = item.id;
      this.itemImg = item.image;
      this.getSimilarMovies(this.itemID);
    },
    prevPage() {
      for (let x = 0; x <= 6; x++) {
        this.items.unshift(this.items.pop());
      }
    },
    nextPage() {
      for (let x = 0; x <= 5; x++) {
        this.items.push(this.items.shift());
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
.imgJanela {
  padding: 0px 5px 0px 0px;
  border-radius: 5px;
  transition: 0.2s;
}

.imgJanela:hover {
  transform: scale(1.1);
}
</style>
