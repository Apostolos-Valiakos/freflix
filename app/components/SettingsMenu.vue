<template>
  <div ref="root" class="relative">
    <button
      aria-label="Settings"
      class="grid place-items-center rounded-full transition"
      :class="[
        placement === 'up' ? 'h-11 w-13' : 'h-10 w-10',
        open ? 'bg-white/20 text-white' : 'text-white/80 hover:text-white',
      ]"
      @click="open = !open"
    >
      <Settings :class="placement === 'up' ? 'h-6 w-6' : 'h-5 w-5'" />
    </button>

    <Transition name="pop">
      <div
        v-if="open"
        class="absolute right-0 z-50 w-56 rounded-2xl border border-white/10 bg-raised/95 p-2 shadow-2xl backdrop-blur-xl"
        :class="placement === 'up' ? 'bottom-full mb-4' : 'top-full mt-3'"
      >
        <button v-if="!account.state.isLoggedIn" class="menu-item" @click="login">
          <LogIn class="h-4 w-4" /> Login
        </button>
        <div v-else class="flex items-center gap-3 px-3 py-2.5 text-sm">
          <CircleUser class="h-4 w-4 text-white/60" />
          <span class="truncate font-semibold">{{ account.state.username }}</span>
        </div>

        <div class="my-1 h-px bg-white/10"></div>

        <NuxtLink to="/lists" class="menu-item" @click="open = false">
          <Bookmark class="h-4 w-4" /> Watchlist
        </NuxtLink>
        <NuxtLink
          v-if="account.state.isLoggedIn"
          :to="{ path: '/lists', query: { tab: 'liked' } }"
          class="menu-item"
          @click="open = false"
        >
          <Heart class="h-4 w-4" /> Liked
        </NuxtLink>
        <NuxtLink
          :to="{ path: '/lists', query: { tab: 'history' } }"
          class="menu-item"
          @click="open = false"
        >
          <History class="h-4 w-4" /> Watch History
        </NuxtLink>

        <template v-if="account.state.isLoggedIn">
          <div class="my-1 h-px bg-white/10"></div>
          <button class="menu-item" @click="logout">
            <LogOut class="h-4 w-4" /> Logout
          </button>
        </template>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import {
  Bookmark,
  CircleUser,
  Heart,
  History,
  LogIn,
  LogOut,
  Settings,
} from "lucide-vue-next";

withDefaults(defineProps<{ placement?: "down" | "up" }>(), {
  placement: "down",
});

const account = useTmdbAccount();
const open = ref(false);
const root = ref<HTMLElement | null>(null);

useClickOutside(root, () => (open.value = false));

function login() {
  open.value = false;
  account.login().catch((err) => console.error(err));
}

function logout() {
  open.value = false;
  account.logout();
}
</script>

<style scoped>
@reference "~/assets/css/main.css";

.menu-item {
  @apply flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-white/85 transition hover:bg-white/10 hover:text-white;
}
</style>
