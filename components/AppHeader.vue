<!-- 20854276 -->
<template>
  <div v-if="mobile" style="background-color: black">
    <div class="d-flex justify-center mb-6 bg-surface-variant">
      <NuxtLink to="/"
        ><img src="~assets/Freflix-logo.png" class="logo" alt="Netflix Logo"
      /></NuxtLink>
    </div>

    <div class="d-flex justify-start mb-6 bg-surface-variant">
      <nav>
        <ul style="list-style-type: none">
          <li>
            <NuxtLink style="text-decoration: none" to="/">Home</NuxtLink>
          </li>
          <li>
            <NuxtLink style="text-decoration: none" to="/Series">
              Series
            </NuxtLink>
          </li>
          <li>
            <NuxtLink style="text-decoration: none" to="/movies">
              Movies
            </NuxtLink>
          </li>
        </ul>
      </nav>
      <div class="d-flex justify-end mb-6 bg-surface-variant">
        <ul style="list-style-type: none">
          <li>
            <NuxtLink style="text-decoration: none" to="/searchResults">
              Search
            </NuxtLink>
          </li>
          <li>
            <NuxtLink style="text-decoration: none" to="/watchlist">
              Watchlist
            </NuxtLink>
          </li>
        </ul>
      </div>
    </div>
  </div>
  <header v-else>
    <NuxtLink to="/"
      ><img src="~assets/Freflix-logo.png" class="logo" alt="Netflix Logo"
    /></NuxtLink>
    <nav>
      <ul style="list-style-type: none">
        <li><NuxtLink style="text-decoration: none" to="/">Home</NuxtLink></li>
        <li>
          <NuxtLink style="text-decoration: none" to="/Series">Series</NuxtLink>
        </li>
        <li>
          <NuxtLink style="text-decoration: none" to="/movies">Movies</NuxtLink>
        </li>
      </ul>
    </nav>
    <ul style="list-style-type: none">
      <li>
        <NuxtLink style="text-decoration: none" to="/searchResults">
          Search
        </NuxtLink>
      </li>
      <li>
        <NuxtLink style="text-decoration: none" to="/watchlist">
          Watchlist
        </NuxtLink>
      </li>
    </ul>
  </header>
</template>
<script>
export default {
  data() {
    sessionID: "";
    watchlist: [];
    return {
      mobile: false,
    };
  },
  created() {
    this.mobile = screen.width < 450;
    this.createSession();
    if (localStorage.sessionID) {
      this.sessionID = localStorage.sessionID;
    }
    if (localStorage.watchlist) {
      this.watchlist = localStorage.watchlist;
    }
  },
  methods: {
    createSession() {
      if (!localStorage.sessionID) {
        const url =
          "https://api.themoviedb.org/3/authentication/guest_session/new";
        const options = {
          method: "GET",
          headers: {
            accept: "application/json",
            Authorization:
              "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwYjE5NTM3NWNkODk0ZGRlNzkwOGNiNzIxMmQwMTBmOCIsInN1YiI6IjY1ODdmNjU1MmRmZmQ4NWNkYjQ0ZDkwNiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.XaBBhvFBh29o9x62S5G3BJ-KVofB-_clblrCU7PUj7M",
          },
        };

        fetch(url, options)
          .then((res) => res.json())
          .then((json) => {
            localStorage.sessionID = json.guest_session_id;
            console.log(localStorage.sessionID);
          })
          .catch((err) => {
            console.log(err);
          });
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
.mobile-header {
  /* display: flex; */
  justify-content: center;
  align-items: center;
  padding: 1em 2.5em;
  position: fixed;
  z-index: 99;
  width: 100%;
}

.search {
  border: none;
  height: 2.25em;
  width: 2.25em;
  border-radius: 1.125em;
  padding-left: 2.25em;

  background: url("~assets/search.svg") no-repeat 0.625em/1em, var(--white);
  cursor: pointer;

  transition-property: width, border-radius, box-shadow;
  transition-duration: 300ms;
}

.search:focus {
  width: 12.5em;
  border-radius: 0.25em;
  box-shadow: 0 0 0 2px var(--red);
  cursor: auto;
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
  cursor: pointer;
}

@media (max-width: 40em) {
  header {
    padding: 1em;
  }
}
</style>
