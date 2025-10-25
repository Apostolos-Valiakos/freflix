<template>
  <v-dialog
    v-model="dialog"
    max-width="450px"
    persistent
    transition="dialog-bottom-transition"
  >
    <v-card class="netflix-dialog-card">
      <v-card-title class="netflix-dialog-title">
        Sign in with TMDB
      </v-card-title>

      <v-card-text class="netflix-dialog-body">
        <p>
          Connect your TMDB account to personalize your Freflix experience.
          You’ll be redirected to TMDB for secure login or registration.
        </p>
      </v-card-text>

      <v-card-actions class="netflix-dialog-actions">
        <v-btn
          color="red darken-2"
          class="netflix-btn"
          depressed
          @click="authenticate('login')"
        >
          Log In
        </v-btn>
        <v-btn
          color="red darken-2"
          class="netflix-btn"
          outlined
          @click="authenticate('register')"
        >
          Register
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn text class="cancel-btn" @click="close">Cancel</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import Cookies from "js-cookie";

export default {
  name: "TmdbAuthDialog",
  props: { value: Boolean },
  data() {
    return { dialog: this.value };
  },
  watch: {
    value(val) {
      this.dialog = val;
    },
    dialog(val) {
      this.$emit("input", val);
    },
  },
  methods: {
    async authenticate(action) {
      try {
        const redirectUrl = `${window.location.origin}/`;
        const res = await fetch(
          "https://api.themoviedb.org/4/auth/request_token",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization:
                "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwYjE5NTM3NWNkODk0ZGRlNzkwOGNiNzIxMmQwMTBmOCIsInN1YiI6IjY1ODdmNjU1MmRmZmQ4NWNkYjQ0ZDkwNiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.XaBBhvFBh29o9x62S5G3BJ-KVofB-_clblrCU7PUj7M",
            },
            body: JSON.stringify({
              redirect_to: redirectUrl,
            }),
          }
        );

        const data = await res.json();
        if (!data.success) throw new Error("Failed to get TMDB token.");

        const tmdbUrl = `https://www.themoviedb.org/auth/access?request_token=${data.request_token}`;
        Cookies.set("tmdb_temp_token", data.request_token, { expires: 1 });

        window.location.href = tmdbUrl;
      } catch (err) {
        console.error(err);
        alert("TMDB authentication failed.");
      }
    },
    close() {
      this.dialog = false;
    },
  },
};
</script>

<style scoped>
.netflix-dialog-card {
  background: rgba(20, 20, 20, 0.95);
  color: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.9);
  text-align: center;
}

.netflix-dialog-title {
  justify-content: center;
  font-weight: 700;
  font-size: 1.4rem;
  color: #ffffff;
}

.netflix-dialog-body p {
  font-size: 1.05rem;
  line-height: 1.5rem;
  color: #cccccc;
  margin: 0;
  padding: 10px 0 20px 0;
}

.netflix-dialog-actions {
  justify-content: center;
  padding-bottom: 10px;
}

.netflix-btn {
  font-weight: 600;
  border-radius: 6px;
  margin: 0 8px;
  min-width: 120px;
  color: white !important;
  text-transform: none;
  letter-spacing: 0.5px;
}

.netflix-btn.v-btn--outlined {
  background-color: transparent !important;
  border: 1px solid #e50914 !important;
}

.cancel-btn {
  color: #999 !important;
  text-transform: none;
  font-size: 0.9rem;
}

.v-dialog__content {
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(6px);
}
</style>
