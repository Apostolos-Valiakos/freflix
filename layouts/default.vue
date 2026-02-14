<template>
  <v-app dark>
    <AppHeader />
    <v-main>
      <v-container style="max-width: 100% !important; padding: 0% !important">
        <Nuxt />
      </v-container>
    </v-main>
    <AppFooter />
  </v-app>
</template>

<script>
import AppFooter from "../components/AppFooter.vue";
import AppHeader from "../components/AppHeader.vue";

export default {
  comments: {
    AppHeader,
    AppFooter,
  },
  name: "DefaultLayout",
  data() {
    return {
      clipped: false,
      drawer: false,
      fixed: false,
      items: [
        {
          icon: "mdi-apps",
          title: "Welcome",
          to: "/",
        },
        {
          icon: "mdi-chart-bubble",
          title: "Inspire",
          to: "/inspire",
        },
      ],
      miniVariant: false,
      right: true,
      rightDrawer: false,
      title: "FreFlix",
    };
  },
  mounted() {
    // We attach the listener when the layout mounts
    if (process.client) {
      App.addListener("backButton", this.handleBackButton);
    }
  },
  beforeDestroy() {
    // Good practice: remove listener if layout is destroyed
    App.removeAllListeners();
  },
  methods: {
    handleBackButton() {
      // 1. Check if we are on the home page.
      // In Nuxt, the home route is usually just '/'
      if (this.$route.path === "/" || this.$route.name === "index") {
        App.exitApp();
      } else {
        // 2. Otherwise, go back one step in history
        this.$router.back();
      }
    },
  },
  components: { AppHeader, AppFooter },
};
</script>
