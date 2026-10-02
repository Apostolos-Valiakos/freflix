<template>
  <div>
    <header
      class="page-gutter pointer-events-none fixed inset-x-0 top-0 z-50 flex items-center justify-between py-3"
    >
      <div class="pointer-events-auto flex items-center gap-3">
        <button
          v-if="!isHome"
          class="grid h-10 w-10 place-items-center rounded-full text-white transition hover:bg-white/10"
          aria-label="Go back"
          @click="goBack"
        >
          <ArrowLeft class="h-6 w-6" />
        </button>
        <NuxtLink to="/" aria-label="Freflix home">
          <img
            src="~/assets/img/freflix-logo.png"
            alt="Freflix"
            class="h-11 w-auto drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] lg:h-13"
          />
        </NuxtLink>
      </div>

      <nav
        class="glass pointer-events-auto hidden h-12 items-center gap-1 rounded-full p-[3px] lg:flex"
      >
        <NuxtLink
          v-for="item in items"
          :key="item.to"
          :to="item.to"
          class="flex h-10 items-center gap-2 rounded-full px-5 text-sm font-medium transition-all duration-300"
          :class="
            isActive(item)
              ? 'bg-white text-black shadow-md'
              : 'text-white/70 hover:text-white'
          "
        >
          <component :is="item.icon" v-if="isActive(item)" class="h-4 w-4" />
          {{ item.label }}
        </NuxtLink>

        <span class="mx-2 h-4 w-px bg-white/15"></span>

        <NuxtLink
          to="/search"
          aria-label="Search"
          class="grid h-10 w-10 place-items-center rounded-full transition"
          :class="
            route.path === '/search'
              ? 'bg-white text-black'
              : 'text-white/80 hover:text-white'
          "
        >
          <Search class="h-5 w-5" />
        </NuxtLink>
        <SettingsMenu />
      </nav>
    </header>

    <nav
      class="glass fixed inset-x-3 bottom-3 z-50 flex h-16 items-center justify-around rounded-full px-2 lg:hidden"
    >
      <NuxtLink
        v-for="item in items"
        :key="item.to"
        :to="item.to"
        :aria-label="item.label"
        class="grid h-11 w-13 place-items-center rounded-full transition"
        :class="isActive(item) ? 'bg-white/20 text-white' : 'text-white/60'"
      >
        <component :is="item.icon" class="h-6 w-6" />
      </NuxtLink>
      <NuxtLink
        to="/search"
        aria-label="Search"
        class="grid h-11 w-13 place-items-center rounded-full transition"
        :class="
          route.path === '/search' ? 'bg-white/20 text-white' : 'text-white/60'
        "
      >
        <Search class="h-6 w-6" />
      </NuxtLink>
      <SettingsMenu placement="up" />
    </nav>
  </div>
</template>

<script setup lang="ts">
import {
  ArrowLeft,
  Bookmark,
  Clapperboard,
  House,
  Search,
  Tv,
} from "lucide-vue-next";

const route = useRoute();
const router = useRouter();

const items = [
  { label: "Home", to: "/", icon: House, match: [] as string[] },
  {
    label: "Movies",
    to: "/movies",
    icon: Clapperboard,
    match: ["/movies", "/movie/"],
  },
  { label: "Shows", to: "/series", icon: Tv, match: ["/series", "/tv/"] },
  { label: "My List", to: "/lists", icon: Bookmark, match: ["/lists"] },
];

const isHome = computed(() => route.path === "/");

function isActive(item: (typeof items)[number]) {
  if (item.to === "/") return isHome.value;
  const path = route.path.toLowerCase();
  return item.match.some((prefix) => path.startsWith(prefix));
}

function goBack() {
  if (window.history.state?.back) {
    router.back();
  } else {
    router.push("/");
  }
}
</script>
