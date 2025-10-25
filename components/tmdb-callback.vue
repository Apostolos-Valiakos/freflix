<template>
  <v-container class="text-center" style="margin-top: 100px">
    <v-progress-circular indeterminate color="primary"></v-progress-circular>
    <p>Finishing authentication...</p>
  </v-container>
</template>
<script>
import Cookies from "js-cookie";

export default {
  async mounted() {
    // The request token is now retrieved from the URL query params, not a cookie,
    // as is typical for the v3 redirect flow.
    const tempToken = this.$route.query.request_token; // You still need your v3 API Key, which you must use in all v3 calls. // Replace 'YOUR_V3_API_KEY' with your actual key.
    const API_KEY = "0b195375cd894dde7908cb7212d010f8";

    if (!tempToken) {
      // Fallback if no token is found in the URL after TMDB redirect
      this.$router.push("/");
      return;
    }

    try {
      // ⚠️ V3 Step 1: Exchange the Request Token for a Session ID (Session Creation)
      const sessionRes = await fetch(
        `https://api.themoviedb.org/3/authentication/session/new?api_key=${API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            request_token: tempToken,
          }),
        }
      );

      const sessionJson = await sessionRes.json();
      if (!sessionRes.ok || !sessionJson.success) {
        throw new Error(
          "V3 Session creation failed: " + sessionJson.status_message
        );
      }

      const sessionId = sessionJson.session_id; // Save the session ID (This replaces your v4 access token cookie)
      alert(sessionId);
      console.log(sessionId);
      Cookies.set("tmdb_session_id", sessionId, { expires: 7 }); // ⚠️ V3 Step 2: Fetch user details using the Session ID
      const accountRes = await fetch(
        `https://api.themoviedb.org/3/account?api_key=${API_KEY}&session_id=${sessionId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      alert(accountRes);
      console.log(accountRes);

      const accountJson = await accountRes.json();
      if (!accountRes.ok || !accountJson.id) {
        throw new Error(
          "Failed to fetch user details: " + accountJson.status_message
        );
      } // Use name if available, fallback to username

      const userName = accountJson.name || accountJson.username || "User";
      Cookies.set("tmdb_user_name", userName, { expires: 7 }); // Alert with user data

      alert(
        `Authentication successful using V3!\n\nUser Details:\nName: ${userName}\nID: ${accountJson.id}\nUsername: ${accountJson.username}`
      );

      this.$router.push("/");
    } catch (err) {
      console.error("Authentication Error:", err);
      alert(
        "Failed to finalize TMDB authentication. Check console for details."
      );
      this.$router.push("/");
    }
  },
};
</script>
