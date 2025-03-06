<template>
  <v-card>
    <v-card-title>Φίλτρα</v-card-title>
    <v-card-text>
      <!-- Show Movies Option -->
      <v-radio-group v-model="showMovies" @change="updateQueryUrl">
        <v-radio label="Όλα" value="all"></v-radio>
        <v-radio label="Ταινίες που δεν έχω δει" value="unseen"></v-radio>
        <v-radio label="Ταινίες που έχω δει" value="seen"></v-radio>
      </v-radio-group>

      <!-- Availability -->
      <v-checkbox
        v-model="availability"
        label="Αναζήτηση όλων των διαθέσιμων;"
        @change="updateQueryUrl"
      ></v-checkbox>

      <!-- Genre Selection -->
      <v-select
        v-model="genres"
        :items="genresList"
        label="Είδη"
        multiple
        @change="updateQueryUrl"
      ></v-select>

      <!-- Display the Generated Query URL -->
      <v-textarea
        label="Generated API URL"
        v-model="queryUrl"
        readonly
      ></v-textarea>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  data() {
    return {
      showMovies: "unseen",
      availability: true,
      releaseDateFrom: null,
      releaseDateTo: new Date().toISOString().substr(0, 10),
      genres: [],
      userRating: [0, 10],
      userVotes: 0,
      duration: [0, 360],
      queryUrl: "",

      // Genres list as per your screenshot
      genresList: [
        { text: "Western", value: "western" },
        { text: "Αστυνομική", value: "crime" },
        { text: "Δράμα", value: "drama" },
        { text: "Δράση", value: "action" },
        { text: "Επ. Φαντασίας", value: "sci-fi" },
        { text: "Θρίλερ", value: "thriller" },
        { text: "Ιστορική", value: "historical" },
        { text: "Κιν. Σχέδια", value: "animation" },
        { text: "Κωμωδία", value: "comedy" },
        { text: "Μουσική", value: "music" },
        { text: "Μυστηρίου", value: "mystery" },
        { text: "Ντοκιμαντέρ", value: "documentary" },
        { text: "Οικογενειακή", value: "family" },
        { text: "Περιπέτεια", value: "adventure" },
        { text: "Πολεμική", value: "war" },
        { text: "Ρομαντική", value: "romantic" },
        { text: "Τρόμου", value: "horror" },
        { text: "Φαντασίας", value: "fantasy" },
        { text: "Τηλεοπτική Ταινία", value: "tv_movie" },
      ],
    };
  },
  watch: {
    // Watch all relevant filter properties and update URL whenever they change
    showMovies: "updateQueryUrl",
    availability: "updateQueryUrl",
    releaseDateFrom: "updateQueryUrl",
    releaseDateTo: "updateQueryUrl",
    genres: "updateQueryUrl",
    userRating: "updateQueryUrl",
    userVotes: "updateQueryUrl",
    duration: "updateQueryUrl",
  },
  methods: {
    updateQueryUrl() {
      const baseUrl = "https://api.themoviedb.org/3/discover/movie?";
      const params = new URLSearchParams();

      // Add filters to the query URL based on current selections
      params.append(
        "watch_status",
        this.showMovies === "unseen" ? "unseen" : "seen"
      );
      if (this.availability) params.append("availability", "all");

      if (this.genres.length > 0)
        params.append("with_genres", this.genres.join(","));

      // Construct the final URL
      this.queryUrl = `${baseUrl}${params.toString()}`;
    },
  },
  mounted() {
    // Initialize query URL based on default values
    this.updateQueryUrl();
  },
};
</script>
