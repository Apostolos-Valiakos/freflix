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
  components: { AppHeader, AppFooter },
};
</script>
