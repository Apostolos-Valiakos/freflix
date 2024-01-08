<template>
  <div>
    <section v-if="movie">
      <!-- {{ movie }} -->
      <!-- <v-img
          :src="'https://image.tmdb.org/t/p/original' + movie.poster_path"
          alt="Movie Poster"
          class="movie-banner"
        />
      </section>
      <section>
        <figure>
          <img
            :src="`https://image.tmdb.org/t/p/w500/${movie.poster_path}`"
            alt="Poster Image"
          />
        </figure> -->
      <v-img
        :src="'https://image.tmdb.org/t/p/original' + movie.poster_path"
        alt="Movie Poster"
        class="movie-banner"
        style="z-index: 1"
      />
      <div style="z-index: 2">
        <v-row>
          <v-col>
            <figure>
              <img
                style="
                  text-align: right;
                  display: flex;
                  justify-content: center;
                "
                :src="`https://image.tmdb.org/t/p/w500/${movie.poster_path}`"
                alt="Poster Image"
                class="movie-poster"
              />
              <v-btn @click="watchMovie(movie.id)"> play </v-btn>
              <!-- <v-select
              class="mx-2"
              v-if="details"
              v-model="selectedSeason"
              label="Season"
              :items="details"
              :item-text="'season'"
              :item-value="'season_number'"
              @change="getNoOfEpisodesForSelectedSeason(selectedSeason)"
            ></v-select>
            <v-select
              v-if="episodes"
              label="Episode"
              v-model="episode"
              :items="episodes"
            ></v-select> -->
            </figure>
          </v-col>
          <v-col>
            <p class="popularity-text">⭐ Rating: {{ movie.vote_average }}</p>
            <h2>{{ movie.original_title }}</h2>
            <p>{{ movie.overview }}</p>
            <p class="genre">Genre:</p>

            <div v-for="genre in movie.genres" :key="genre.id">
              <p>
                {{ genre.name }}
              </p>
            </div>
          </v-col>
        </v-row>
      </div>
    </section>

    <v-sheet class="d-flex align-content-center flex-wrap bg-surface-variant">
      <!-- <h4 class="text-h5 font-weight-bold mb-4">Similar Movies</h4> -->

      <div
        v-for="(item, index) in similarMovies"
        :key="index"
        class="ma-2 pa-2"
      >
        <!-- Στο κλικ να ενημερώνεται το topMovie και το SimilarMovies -->
        <!-- {{ item }} -->
        <v-card
          class="ma-2 pa-2 mx-auto"
          @click="handleClick(item)"
          v-if="item !== undefined"
          width="200"
          height="300"
        >
          <v-card-text
            style="text-align: center; justify-content: center; display: flex"
            >{{ item.name }}</v-card-text
          >
          <v-img
            v-if="item.poster_path"
            contain
            class="movie-poster"
            :src="'https://image.tmdb.org/t/p//w500' + item.poster_path"
            max-width="200"
            max-height="200"
          />
          <v-sheet v-else max-height="200" width="200" color="grey"></v-sheet>
        </v-card>
      </div>
    </v-sheet>
  </div>
</template>
<script>
export default {
  name: "single-movie",
  data() {
    return {
      season: 1,
      episode: 1,
      selectedSeriesInfo: null,
      params: null,
      popup: false,
      movie: null,
      similarMovies: [],
    };
  },
  async created() {
    this.params = this.$route.params.id;
    console.log(this.params);
    this.getTopMovie(this.params);
    this.getSimilarMovies(this.params);
  },
  methods: {
    async getTopMovie(id) {
      this.movie = await fetch(
        `https://api.themoviedb.org/3/tv/${id}?api_key=5b75818e63dfdb396cadedf77425b334&language=en-US&page=1`
      ).then((res) => res.json());
      console.log(this.movie);
    },
    watchMovie(id) {
      location.href = "https://vidsrc.xyz/embed/tv/" + id;
    },
    handleClick(item) {
      this.getTopMovie(item.id);
      this.getSimilarMovies(item.id);
    },
    async getSimilarMovies(ID) {
      this.similarMovies = [];
      const url =
        "https://api.themoviedb.org/3/tv/" +
        ID +
        "/similar?language=en-US&page=1";
      const options = {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization:
            "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwYjE5NTM3NWNkODk0ZGRlNzkwOGNiNzIxMmQwMTBmOCIsInN1YiI6IjY1ODdmNjU1MmRmZmQ4NWNkYjQ0ZDkwNiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.XaBBhvFBh29o9x62S5G3BJ-KVofB-_clblrCU7PUj7M",
        },
      };

      await fetch(url, options)
        .then((res) => res.json())
        .then(async (json) => {
          for (let index = 0; index < json.results.length; index++) {
            const element = json.results[index];
            if (element !== undefined) {
              this.similarMovies.push(element);
            }
          }
          this.similarMovies.splice(0, 1);
        })
        .catch((err) => console.error("error:" + err));
    },
    // getNoOfEpisodesForSelectedSeason(selectedSeason) {
    //   console.log(selectedSeason);
    //   this.selectedSeriesInfo.seasons.forEach((element) => {
    //     if (element.name === selectedSeason) {
    //       this.season = element.season_number;
    //       for (let index = 0; index < element.episode_count; index++) {
    //         this.episodes.push(index);
    //       }
    //     }
    //   });
    // },
    // async getDetails(id) {
    //   const url = "https://api.themoviedb.org/3/tv/" + id + "?language=en-US";
    //   const options = {
    //     method: "GET",
    //     headers: {
    //       accept: "application/json",
    //       Authorization:
    //         "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwYjE5NTM3NWNkODk0ZGRlNzkwOGNiNzIxMmQwMTBmOCIsInN1YiI6IjY1ODdmNjU1MmRmZmQ4NWNkYjQ0ZDkwNiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.XaBBhvFBh29o9x62S5G3BJ-KVofB-_clblrCU7PUj7M",
    //     },
    //   };

    //   await fetch(url, options)
    //     .then((res) => res.json())
    //     .then((json) => {
    //       json.seasons.forEach((element) => {
    //         this.details.push({ season: element.name });
    //       });
    //       this.selectedSeriesInfo = json;
    //       console.log(json);
    //     })
    //     .catch((err) => console.error("error:" + err));
    // },
  },
};
</script>
<style scoped>
h1,
p {
  padding: 0;
  margin: 0;
}

section:first-child {
  height: 70vh;
  object-fit: cover;
  position: relative;
}

section:first-child::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  height: 0;
  padding-bottom: calc(33.5% - 92px + 30px);
  width: 100%;
  background-image: linear-gradient(
    transparent,
    rgba(25, 26, 26, 0.4) 10%,
    rgba(25, 26, 26, 0.6) 20%,
    rgba(25, 26, 26, 0.8) 80%,
    var(--dark-grey)
  );
  z-index: -1;
}

section:nth-child(2) {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: -10em;
}

.popularity-text {
  padding-bottom: 0.3em;
}

h2 {
  padding: 0;
  margin: 0;
  max-width: 15em;
  font-size: 2rem;
}

p {
  padding: 0;
  margin: 0;
  max-width: 30em;
  font-size: 1.3rem;
}

.genre {
  padding-top: 1em;
}

.movie-banner {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  position: absolute;
  left: 0;
  z-index: -1;
  opacity: 0.8;
}

.movie-poster {
  width: 15em;
}

@media (max-width: 50em) {
  section:nth-child(2) {
    flex-direction: column;
    padding: 0 1em;
    /* text-align: ; */
  }

  h2 {
    font-size: 1.7rem;
  }

  p {
    font-size: 1.2rem;
  }
}
.movie-grid {
  display: grid;
  grid-template-columns: auto auto auto auto auto;
  padding: 10px;
}

.grid-item {
  padding: 20px;
  text-align: center;
}
</style>
