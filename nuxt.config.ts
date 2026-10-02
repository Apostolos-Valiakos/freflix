import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",

  // Client-only app: deployed as static files and wrapped by Capacitor
  ssr: false,

  css: ["~/assets/css/main.css"],

  vite: {
    plugins: [tailwindcss()],
  },

  runtimeConfig: {
    public: {
      // Read-only TMDB v4 token; override with NUXT_PUBLIC_TMDB_TOKEN
      tmdbToken:
        "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwYjE5NTM3NWNkODk0ZGRlNzkwOGNiNzIxMmQwMTBmOCIsInN1YiI6IjY1ODdmNjU1MmRmZmQ4NWNkYjQ0ZDkwNiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.XaBBhvFBh29o9x62S5G3BJ-KVofB-_clblrCU7PUj7M",
    },
  },

  app: {
    head: {
      titleTemplate: "%s - by Gizzlaa",
      title: "Freflix",
      htmlAttrs: { lang: "en" },
      meta: [
        { charset: "utf-8" },
        {
          name: "viewport",
          content: "width=device-width, initial-scale=1, viewport-fit=cover",
        },
        { name: "description", content: "" },
        { name: "format-detection", content: "telephone=no" },
        { name: "theme-color", content: "#050505" },
        {
          name: "google-site-verification",
          content: "2NXMENk8H7IDFXq7552Hyreo1Jmyb_K0DdXk83LJIMM",
        },
      ],
      link: [
        { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossorigin: "",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap",
        },
        { rel: "preconnect", href: "https://image.tmdb.org" },
      ],
      script: [
        {
          src: "https://www.googletagmanager.com/gtag/js?id=G-XMRB0HFGVK",
          async: true,
        },
        {
          innerHTML:
            "window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-XMRB0HFGVK');",
        },
      ],
    },
  },
});
