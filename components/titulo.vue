<template>
  <div class="ml-16">
    <v-row>
      <v-col cols="12">
        <v-img
          contain
          :src="'https://image.tmdb.org/t/p//w500' + poster_path"
          style="
            margin-top: 5%;
            max-width: 600px;
            max-height: 400px;
            width: auto;
            height: auto;
          "
        />
      </v-col>
      <h5 class="text-h5">{{ title }}</h5>

      <v-col cols="12" class="d-flex flex-row ma-0 pa-0">
        <!-- TODO: Να φαίνονται τα αστέρια ανάλογα με την συνολίκή βαθμολογία -->
        <v-btn icon color="primary"> <v-icon>mdi-star</v-icon> </v-btn>
        <v-btn icon color="primary"> <v-icon>mdi-star</v-icon> </v-btn>
        <v-btn icon color="primary"> <v-icon>mdi-star</v-icon> </v-btn>
        <v-btn icon color="primary"> <v-icon>mdi-star</v-icon> </v-btn>
        <v-btn icon color="primary"> <v-icon>mdi-star</v-icon> </v-btn>
        <p class="pa-0 ml-3 mt-2 mb-0 font-weight-light">
          {{ release_date }}
        </p>
        <!-- TODO: Να φαίνεται η διάρκεια της ταινίας -->
        <p class="pa-0 ml-3 mt-2 mb-0 font-weight-light">124 min</p>
        <v-chip class="mt-2 mb-0 ml-3" small> {{ votes }} / 10 </v-chip>
        <v-chip class="ml-3 mt-2 mb-0" small>
          {{ vote_count }} total reviews
        </v-chip>
      </v-col>
      <v-col cols="12">
        <p class="subheading font-weight-regular">
          {{ overview }}
        </p>
      </v-col>

      <v-col cols="12">
        <v-btn class="black--text mr-2" color="white" @click="handleClick">
          <v-icon color="black">mdi-play</v-icon>
          Play
        </v-btn>
        <!-- <v-btn color="grey">
          <v-icon>mdi-alert-circle-outline</v-icon>
          Information
        </v-btn> -->
      </v-col>
    </v-row>
  </div>
</template>

<script>
export default {
  name: "Titulo",
  props: {
    title: String,
    overview: String,
    poster_path: String,
    id: Number,
    votes: Number,
    vote_count: Number,
    release_date: String,
    isSerie: String,
    episode: String,
    season: String,
  },
  methods: {
    handleClick() {
      if (this.isSerie === "tv") {
        location.href =
          "https://autoembed.to/" +
          this.isSerie +
          "/tmdb/" +
          this.id +
          "-" +
          this.sseason +
          "-" +
          this.episode;
      } else {
        location.href = "https://autoembed.to/movie/tmdb/" + this.id;
      }
    },
  },
  data() {
    return {
      ecosystem: [
        {
          text: "vuetify-loader",
          href: "https://github.com/vuetifyjs/vuetify-loader",
        },
        {
          text: "github",
          href: "https://github.com/vuetifyjs/vuetify",
        },
        {
          text: "awesome-vuetify",
          href: "https://github.com/vuetifyjs/awesome-vuetify",
        },
      ],
      importantLinks: [
        {
          text: "Documentation",
          href: "https://vuetifyjs.com",
        },
        {
          text: "Chat",
          href: "https://community.vuetifyjs.com",
        },
        {
          text: "Made with Vuetify",
          href: "https://madewithvuejs.com/vuetify",
        },
        {
          text: "Twitter",
          href: "https://twitter.com/vuetifyjs",
        },
        {
          text: "Articles",
          href: "https://medium.com/vuetify",
        },
      ],
      whatsNext: [
        {
          text: "Explore components",
          href: "https://vuetifyjs.com/components/api-explorer",
        },
        {
          text: "Select a layout",
          href: "https://vuetifyjs.com/getting-started/pre-made-layouts",
        },
        {
          text: "Frequently Asked Questions",
          href: "https://vuetifyjs.com/getting-started/frequently-asked-questions",
        },
      ],
    };
  },
};
</script>
