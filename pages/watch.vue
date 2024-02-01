<template>
  <div v-if="movieID" class="space-above">
    <iframe
      class="space-above"
      style="margin-top: 100px"
      width="100%"
      height="800px"
      :src="movieID"
      frameborder="0"
    ></iframe>
  </div>
</template>

<script>
export default {
  data() {
    return {
      movieID: null,
    };
  },
  created() {
    this.movieID =
      "https://multiembed.mov/?video_id=" + this.$route.query.id + "&tmdb=1";
  },
};
</script>
<style>
.space-above {
  margin-top: 100px;
  margin: 0; /* Reset default margin */
}
</style>
