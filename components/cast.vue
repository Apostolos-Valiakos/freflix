<template>
  <div style="background-color: black">
    <div @keyup.right="nextPage" @keyup.left="prevPage">
      <v-carousel
        hide-delimiters
        show-arrows-on-hover
        style="
          max-height: 280px;
          white-space: nowrap;
          display: inline-block;
          overflow: hidden;
        "
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
          class="cast"
        >
          <div class="d-flex align-center">
            <v-card
              v-for="(item, index) in cast"
              :key="index"
              class="cast-card elevation-2 mx-1"
              @mouseover="item.isActive = true"
              @mouseleave="item.isActive = false"
              style="
                height: 100%;
                min-width: 150px;
                max-width: 150px;
                transition: transform 0.3s;
                overflow: hidden;
                border: none;
                background-color: black;
              "
            >
              <v-img
                style="
                  height: 100%;
                  min-width: 150px;
                  max-width: 150px;
                  transition: transform 0.3s;
                  overflow: hidden;
                  border: none;
                "
                :src="
                  'https://image.tmdb.org/t/p/w500' + (item.profile_path || '')
                "
                :lazy-src="
                  'https://image.tmdb.org/t/p/w500' + (item.profile_path || '')
                "
                contain
                class="cast-poster"
              ></v-img>
              {{ item.original_name }}
            </v-card>
          </div>
        </v-carousel-item>
      </v-carousel>
    </div>
  </div>
</template>

<script>
export default {
  name: "ProfileCarousel",
  props: {
    cast: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      slider: [1, 2, 3, 4],
    };
  },
  methods: {
    prevPage() {
      for (let x = 0; x <= this.columns; x++) {
        this.cast.unshift(this.cast.pop());
      }
    },
    nextPage() {
      for (let x = 0; x <= this.columns; x++) {
        this.cast.push(this.cast.shift());
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
.cast-card {
  overflow: hidden;
}
.movie-poster {
  margin: 0; /* Remove margin to eliminate black space */
}
.v-carousel-item {
  transition: transform 0.5s ease; /* Transition for smooth animation */
}
</style>
