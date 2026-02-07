<template>
  <div style="background-color: black" class="py-6">
    <v-card-title class="white--text font-weight-bold ml-4 mb-2">
      Series Cast
    </v-card-title>

    <div @keyup.right="nextPage" @keyup.left="prevPage">
      <v-carousel
        v-model="activePage"
        hide-delimiters
        :show-arrows="cast && cast.length > columns"
        height="auto"
        class="cast-carousel"
      >
        <template v-slot:prev="{ on, attrs }">
          <v-btn icon v-bind="attrs" v-on="on" class="carousel-nav">
            <v-icon color="white">mdi-chevron-left</v-icon>
          </v-btn>
        </template>
        <template v-slot:next="{ on, attrs }">
          <v-btn icon v-bind="attrs" v-on="on" class="carousel-nav">
            <v-icon color="white">mdi-chevron-right</v-icon>
          </v-btn>
        </template>

        <v-carousel-item v-for="(page, pIndex) in paginatedCast" :key="pIndex">
          <div class="d-flex justify-center align-center">
            <v-card
              v-for="(item, iIndex) in page"
              :key="item.id || iIndex"
              class="cast-card mx-2"
              style="background-color: #1a1a1a"
            >
              <v-img
                :src="
                  item.profile_path
                    ? 'https://image.tmdb.org/t/p/w342' + item.profile_path
                    : 'https://via.placeholder.com/342x513?text=No+Photo'
                "
                aspect-ratio="0.66"
                cover
                class="cast-poster"
              >
                <div class="fill-height d-flex align-end">
                  <div class="text-overlay w-100">
                    <div class="cast-name px-1">{{ item.original_name }}</div>
                    <div class="character-name px-1">{{ item.character }}</div>
                  </div>
                </div>
              </v-img>
            </v-card>
          </div>
        </v-carousel-item>
      </v-carousel>
    </div>
  </div>
</template>

<script>
export default {
  name: "CastCarousel",
  props: {
    cast: {
      type: Array,
      required: true,
      default: () => [],
    },
  },
  data() {
    return {
      activePage: 0,
    };
  },
  computed: {
    // Determine how many cards to show per slide
    columns() {
      if (this.$vuetify.breakpoint.xl) return 8;
      if (this.$vuetify.breakpoint.lg) return 6;
      if (this.$vuetify.breakpoint.md) return 4;
      if (this.$vuetify.breakpoint.sm) return 3;
      return 2;
    },
    // Chunk the cast array into pages
    paginatedCast() {
      const chunks = [];
      for (let i = 0; i < this.cast.length; i += this.columns) {
        chunks.push(this.cast.slice(i, i + this.columns));
      }
      return chunks;
    },
  },
  methods: {
    nextPage() {
      if (this.activePage < this.paginatedCast.length - 1) {
        this.activePage++;
      } else {
        this.activePage = 0;
      }
    },
    prevPage() {
      if (this.activePage > 0) {
        this.activePage--;
      } else {
        this.activePage = this.paginatedCast.length - 1;
      }
    },
  },
};
</script>

<style scoped>
.cast-carousel {
  background-color: black;
}

.cast-card {
  width: 160px;
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.cast-card:hover {
  transform: translateY(-10px);
  z-index: 5;
  box-shadow: 0 10px 20px rgba(255, 0, 0, 0.3);
}

.text-overlay {
  background: linear-gradient(to top, rgba(0, 0, 0, 0.9) 0%, transparent 100%);
  padding-bottom: 8px;
  padding-top: 20px;
}

.cast-name {
  color: white;
  font-weight: bold;
  font-size: 0.85rem;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.character-name {
  color: #ff4500;
  font-size: 0.7rem;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.carousel-nav {
  background: rgba(255, 255, 255, 0.1) !important;
  backdrop-filter: blur(5px);
}

.carousel-nav:hover {
  background: rgba(255, 0, 0, 0.6) !important;
}

@media (max-width: 600px) {
  .cast-card {
    width: 130px;
  }
}
</style>
