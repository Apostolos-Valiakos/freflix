<template>
  <div style="background-color: black">
    <div @keyup.right="nextPage" @keyup.left="prevPage">
      <v-carousel
        hide-delimiters
        show-arrows-on-hover
        style="white-space: nowrap; display: inline-block; overflow: hidden"
        class="carousel"
      >
        <template v-slot:prev="{ on, attrs }">
          <v-btn
            icon
            v-bind="attrs"
            v-on="on"
            @click="prevPage"
            class="carousel-nav"
          >
            <v-icon>mdi-chevron-left</v-icon>
          </v-btn>
        </template>
        <template v-slot:next="{ on, attrs }">
          <v-btn
            icon
            v-bind="attrs"
            v-on="on"
            @click="nextPage"
            class="carousel-nav"
          >
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
              class="cast-card mx-1"
              @mouseover="item.isActive = true"
              @mouseleave="item.isActive = false"
              style="
                height: 100%;
                min-width: 160px;
                max-width: 160px;
                overflow: hidden;
                border: none;
                background-color: black;
              "
            >
              <v-img
                style="height: 100%; transition: transform 0.3s; border: none"
                :src="
                  'https://image.tmdb.org/t/p/w500' + (item.profile_path || '')
                "
                contain
                class="cast-poster"
              ></v-img>
              <v-card-text style="padding: 0px !important" class="cast-name">
                {{ item.original_name }}
              </v-card-text>
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
  padding: 1rem 0;
}
.cast-card {
  overflow: hidden;
  border-radius: 12px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  position: relative;
}
.cast-card:hover {
  transform: translateY(-8px) scale(1.05);
  box-shadow: 0 12px 32px rgba(255, 0, 0, 0.4);
  z-index: 10;
}
.cast-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(180deg, transparent 70%, rgba(0, 0, 0, 0.8) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}
.cast-card:hover::before {
  opacity: 1;
}
.cast-poster {
  margin: 0; /* Remove margin to eliminate black space */
  border-radius: 12px;
  transition: transform 0.3s ease;
}
.cast-card:hover .cast-poster {
  transform: scale(1.1);
}
.v-carousel-item {
  transition: transform 0.5s ease; /* Transition for smooth animation */
}
.cast-name {
  color: #f0f0f0;
  font-weight: bold;
  text-align: center;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
  background: linear-gradient(45deg, #ff0000, #ff4500);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0.5rem 0 !important;
  margin-top: 0;
  transition: margin-top 0.3s ease;
}
.cast-card:hover .cast-name {
  margin-top: 20px;
}
.carousel-nav {
  background: rgba(0, 0, 0, 0.7) !important;
  border-radius: 50% !important;
  transition: all 0.3s ease;
}
.carousel-nav:hover {
  background: rgba(255, 0, 0, 0.8) !important;
  transform: scale(1.1);
}

/* Responsive adjustments */
@media (max-width: 959px) {
  .cast-card {
    min-width: 140px !important;
    max-width: 140px !important;
  }
  .cast-name {
    font-size: 0.8rem;
  }
}

@media (max-width: 599px) {
  .cast-card {
    min-width: 120px !important;
    max-width: 120px !important;
  }
  .cast-name {
    font-size: 0.7rem;
  }
  .carousel {
    padding: 0.5rem 0;
  }
}
</style>
