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
import { App } from "@capacitor/app";

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
    if (process.client) {
      App.addListener("backButton", this.handleBackButton).then(
        (handle) => { this._backButtonHandle = handle; }
      );
    }
  },
  beforeDestroy() {
    if (this._backButtonHandle) {
      this._backButtonHandle.remove();
    }
  },
  methods: {
    handleBackButton({ canGoBack }) {
      if (canGoBack) {
        window.history.back();
      } else {
        App.exitApp();
      }
    },
  },
  components: { AppHeader, AppFooter },
};
</script>
