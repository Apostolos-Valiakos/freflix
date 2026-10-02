// Keeps links to the previous site working (bookmarks, shared watch-party invites)
export default defineNuxtRouteMiddleware((to) => {
  const path = to.path.toLowerCase().replace(/\/$/, "");
  const { id, ...rest } = to.query;

  if (path === "/info" && id) {
    return navigateTo({ path: `/movie/${id}`, query: rest }, { replace: true });
  }
  if (path === "/infoseries" && id) {
    return navigateTo({ path: `/tv/${id}`, query: rest }, { replace: true });
  }
  if (path === "/info" || path === "/infoseries") {
    return navigateTo("/", { replace: true });
  }
  if (path === "/searchresults") {
    return navigateTo("/search", { replace: true });
  }
  if (path === "/watchlist") {
    return navigateTo("/lists", { replace: true });
  }
  if (path === "/liked" || path === "/history") {
    return navigateTo(
      { path: "/lists", query: { tab: path.slice(1) } },
      { replace: true }
    );
  }
});
