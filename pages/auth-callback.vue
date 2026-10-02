<template>
  <div class="callback-container">
    <template v-if="status === 'pending'">
      <v-progress-circular indeterminate color="red" size="48" />
      <p class="mt-4">Signing you in...</p>
    </template>
    <template v-else>
      <p class="error-text">{{ errorMessage }}</p>
      <v-btn color="red" dark rounded @click="retry">Try again</v-btn>
    </template>
  </div>
</template>

<script>
export default {
  data() {
    return {
      status: "pending",
      errorMessage: "",
    };
  },
  async created() {
    const result = await this.$tmdb.handleAuthCallback(this.$route.query);
    if (result.success) {
      this.$router.replace("/");
      return;
    }
    this.status = "error";
    this.errorMessage =
      result.reason === "denied"
        ? "Login was cancelled."
        : "Something went wrong signing you in.";
  },
  methods: {
    retry() {
      this.$tmdb.login();
    },
  },
};
</script>

<style scoped>
.callback-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: black;
  color: white;
}
.error-text {
  margin-bottom: 1rem;
}
</style>
