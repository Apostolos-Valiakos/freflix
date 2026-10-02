<template>
  <v-app-bar app dark flat color="black" height="64" class="px-md-10">
    <v-toolbar-title class="pa-0">
      <NuxtLink to="/">
        <img
          src="~assets/Freflix-logo.png"
          class="logo mt-2"
          alt="Freflix Logo"
        />
      </NuxtLink>
    </v-toolbar-title>

    <template v-if="!isMobile">
      <div class="ml-5">
        <v-btn text color="white" :to="{ path: '/' }"> Home </v-btn>
        <v-btn text color="white" :to="{ path: '/Series' }"> Series </v-btn>
        <v-btn text color="white" :to="{ path: '/movies' }"> Movies </v-btn>
      </div>
    </template>

    <v-spacer></v-spacer>

    <template v-if="!isMobile">
      <v-btn text color="white" :to="{ path: '/searchResults' }">
        Search
      </v-btn>
      <v-btn text color="white" :to="{ path: '/watchlist' }"> Watchlist </v-btn>
      <v-btn text color="white" :to="{ path: '/history' }"> History </v-btn>
      <v-btn v-if="isLoggedIn" text color="white" :to="{ path: '/liked' }">
        Liked
      </v-btn>
      <v-btn v-if="!isLoggedIn" text color="white" @click="$tmdb.login()">
        Login
      </v-btn>
      <v-menu v-else offset-y left>
        <template v-slot:activator="{ on, attrs }">
          <v-btn text color="white" v-bind="attrs" v-on="on">
            {{ username }}
          </v-btn>
        </template>
        <v-list dark color="black">
          <v-list-item @click="$tmdb.logout()">
            <v-list-item-title>Logout</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </template>

    <v-menu v-else offset-y left>
      <template v-slot:activator="{ on, attrs }">
        <v-btn icon v-bind="attrs" v-on="on">
          <v-icon>mdi-menu</v-icon>
        </v-btn>
      </template>

      <v-list dark color="black">
        <v-list-item :to="{ path: '/' }" exact>
          <v-list-item-title>Home</v-list-item-title>
        </v-list-item>
        <v-list-item :to="{ path: '/Series' }">
          <v-list-item-title>Series</v-list-item-title>
        </v-list-item>
        <v-list-item :to="{ path: '/movies' }">
          <v-list-item-title>Movies</v-list-item-title>
        </v-list-item>
        <v-divider></v-divider>
        <v-list-item :to="{ path: '/searchResults' }">
          <v-list-item-title>Search</v-list-item-title>
        </v-list-item>
        <v-list-item :to="{ path: '/watchlist' }">
          <v-list-item-title>Watchlist</v-list-item-title>
        </v-list-item>
        <v-list-item :to="{ path: '/history' }">
          <v-list-item-title>History</v-list-item-title>
        </v-list-item>
        <v-list-item v-if="isLoggedIn" :to="{ path: '/liked' }">
          <v-list-item-title>Liked</v-list-item-title>
        </v-list-item>
        <v-divider></v-divider>
        <v-list-item v-if="!isLoggedIn" @click="$tmdb.login()">
          <v-list-item-title>Login</v-list-item-title>
        </v-list-item>
        <v-list-item v-else @click="$tmdb.logout()">
          <v-list-item-title>Logout ({{ username }})</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </v-app-bar>
</template>

<script>
export default {
  // Using $vuetify.breakpoint.mobile for responsiveness
  computed: {
    isMobile() {
      // isMobile is true for screen sizes < sm (i.e., less than 600px by default)
      return this.$vuetify.breakpoint.smAndDown;
    },
    isLoggedIn() {
      return this.$tmdb.state.isLoggedIn;
    },
    username() {
      return this.$tmdb.state.username;
    },
  },
};
</script>

<style scoped>
/* Scoped styles are minimal, relying on Vuetify classes */
.logo {
  /* Reduced size for better fit in the v-app-bar */
  width: 6em;
  height: auto;
  margin-top: 4px; /* Slight adjustment to center */
}

/* Override NuxtLink default styling for links inside v-tabs/v-btn */
a {
  text-decoration: none !important;
  color: inherit;
}

/* Ensuring the app bar is fixed and on top */
.v-app-bar {
  position: fixed;
  z-index: 99;
}
</style>
