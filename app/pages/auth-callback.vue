<template>
  <div class="flex min-h-screen flex-col items-center justify-center gap-4">
    <template v-if="status === 'pending'">
      <LoaderCircle class="h-12 w-12 animate-spin text-accent" />
      <p>Signing you in...</p>
    </template>
    <template v-else>
      <p>{{ errorMessage }}</p>
      <button
        class="h-11 rounded-full bg-accent px-6 font-semibold text-white"
        @click="account.login()"
      >
        Try again
      </button>
    </template>
  </div>
</template>

<script setup lang="ts">
import { LoaderCircle } from "lucide-vue-next";

const route = useRoute();
const router = useRouter();
const account = useTmdbAccount();

const status = ref("pending");
const errorMessage = ref("");

onMounted(async () => {
  const result = await account.handleAuthCallback(route.query);
  if (result.success) {
    router.replace("/");
    return;
  }
  status.value = "error";
  errorMessage.value =
    result.reason === "denied"
      ? "Login was cancelled."
      : "Something went wrong signing you in.";
});
</script>
