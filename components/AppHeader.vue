<template>
  <div>
    <div v-if="mobile" style="background-color: black">
      <div class="d-flex justify-center mb-6 bg-surface-variant">
        <NuxtLink to="/">
          <img src="~assets/Freflix-logo.png" class="logo" alt="Netflix Logo" />
        </NuxtLink>
      </div>
      <br />
      <div class="justify-center mb-6 bg-surface-variant">
        <nav style="text-align: center; justify-content: center; display: flex">
          <ul style="list-style-type: none">
            <li><NuxtLink to="/">Home</NuxtLink></li>
            <li><NuxtLink to="/Series">Series</NuxtLink></li>
            <li><NuxtLink to="/movies">Movies</NuxtLink></li>
          </ul>
        </nav>
        <div class="justify-center mb-6 bg-surface-variant">
          <nav
            style="text-align: center; justify-content: center; display: flex"
          >
            <ul style="list-style-type: none">
              <li><NuxtLink to="/searchResults">Search</NuxtLink></li>
              <li><NuxtLink to="/watchlist">Watchlist</NuxtLink></li>
              <li><NuxtLink to="/history">History</NuxtLink></li>
            </ul>
          </nav>
        </div>
      </div>
    </div>

    <header v-else>
      <NuxtLink to="/">
        <img src="~assets/Freflix-logo.png" class="logo" alt="Netflix Logo" />
      </NuxtLink>
      <nav>
        <ul style="list-style-type: none">
          <li><NuxtLink to="/">Home</NuxtLink></li>
          <li><NuxtLink to="/Series">Series</NuxtLink></li>
          <li><NuxtLink to="/movies">Movies</NuxtLink></li>
        </ul>
      </nav>
      <ul style="list-style-type: none">
        <li><NuxtLink to="/searchResults">Search</NuxtLink></li>
        <li><NuxtLink to="/watchlist">Watchlist</NuxtLink></li>
        <li><NuxtLink to="/history">History</NuxtLink></li>
      </ul>

      <v-btn text @click="showDialog = true"> Login / Register</v-btn>

      <tmdb-auth-dialog v-model="showDialog" />
    </header>
  </div>
</template>

<script>
import TmdbAuthDialog from "./tmdbDialog.vue";
import Cookies from "js-cookie";

export default {
  components: { TmdbAuthDialog },
  data() {
    return {
      mobile: false,
      showDialog: false,
    };
  },
  created() {
    this.mobile = screen.width < 450;
    this.createGuestSession();
  },
  methods: {
    async createGuestSession() {
      if (!Cookies.get("tmdb_guest_session")) {
        try {
          const res = await fetch(
            "https://api.themoviedb.org/3/authentication/guest_session/new",
            {
              method: "GET",
              headers: {
                accept: "application/json",
                Authorization:
                  "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwYjE5NTM3NWNkODk0ZGRlNzkwOGNiNzIxMmQwMTBmOCIsInN1YiI6IjY1ODdmNjU1MmRmZmQ4NWNkYjQ0ZDkwNiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.XaBBhvFBh29o9x62S5G3BJ-KVofB-_clblrCU7PUj7M",
              },
            }
          );
          const json = await res.json();
          if (json.success) {
            Cookies.set("tmdb_guest_session", json.guest_session_id, {
              expires: 7,
            });
          }
        } catch (err) {
          console.error(err);
        }
      }
    },
  },
};
</script>

<style scoped>
header {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1em 2.5em;
  position: fixed;
  z-index: 99;
  width: 100%;
}
.logo {
  width: 8em;
}
nav {
  flex-grow: 1;
}
ul {
  display: flex;
  gap: 2em;
}
ul li > a {
  color: var(--white);
  text-decoration: none;
}
.v-btn {
  margin-left: 1em;
}
</style>
