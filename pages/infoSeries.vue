<template>
  <div>
    <section v-if="movie">
      <v-img
        :src="'https://image.tmdb.org/t/p/original' + movie.poster_path"
        alt="Movie Poster"
        class="movie-banner"
      />
      <div style="z-index: 1">
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
              <v-btn
                @click="watchMovie(movie.id)"
                style="color: white"
                color="red"
              >
                play
              </v-btn>

              <v-select
                style="width: 300px"
                filled
                class="mt-10"
                v-if="details"
                v-model="selectedSeason"
                label="Season"
                :items="details"
                :item-text="'season'"
                :item-value="'season_number'"
                @change="getNoOfEpisodesForSelectedSeason(selectedSeason)"
              ></v-select>
              <v-select
                style="width: 300px"
                filled
                v-if="episodes"
                label="Episode"
                v-model="episode"
                :items="episodes"
              ></v-select>
            </figure>
          </v-col>
          <v-col>
            <p class="popularity-text">
              ⭐ Rating: {{ movie.vote_average }} out of
              {{ movie.vote_count }} votes on IMDB
            </p>
            <h2>{{ movie.name }}</h2>
            <h3>Last air date: {{ movie.last_air_date }}</h3>
            <p>{{ movie.overview }}</p>
            <br />
            <h3>
              Last Episode to air:
              <v-chip> {{ movie.last_episode_to_air.name }} </v-chip>
            </h3>
            <p class="genre">Genre:</p>

            <div
              class="in-row"
              style="display: flex; flex-direction: row; flex-wrap: nowrap"
            >
              <div v-for="genre in movie.genres" :key="genre.id">
                <v-chip class="ma-2 pa-2">
                  {{ genre.name }}
                </v-chip>
              </div>
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
      selectedSeason: 1,
      details: [],
      season: 1,
      episode: 1,
      episodes: [],
      selectedSeriesInfo: null,
      query: null,
      popup: false,
      movie: null,
      similarMovies: [],
    };
  },
  async created() {
    if (this.$route.query.id) {
      this.query = this.$route.query.id;
      this.setCookie("id", this.query, 1);
    } else {
      this.query = this.getCookie("id");
    }
    // console.log(this.query);
    this.getTopMovie(this.query);
    this.getSimilarMovies(this.query);
    this.getDetails(this.query);
  },
  methods: {
    setCookie(name, value, days) {
      var expires = "";
      if (days) {
        var date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        expires = "; expires=" + date.toUTCString();
      }
      document.cookie = name + "=" + (value || "") + expires + "; path=/";
    },
    getCookie(name) {
      var nameEQ = name + "=";
      var ca = document.cookie.split(";");
      for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == " ") c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
      }
      return null;
    },
    eraseCookie(name) {
      document.cookie =
        name + "=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    },
    async getTopMovie(id) {
      this.movie = await fetch(
        `https://api.themoviedb.org/3/tv/${id}?api_key=5b75818e63dfdb396cadedf77425b334&language=en-US&page=1`
      ).then((res) => res.json());
      console.log(this.movie);
    },
    watchMovie(id) {
      location.href =
        "https://multiembed.mov/?video_id=" +
        id +
        "&tmdb=1&s=" +
        this.season +
        "&e=" +
        this.episode;
    },
    handleClick(item) {
      console.log(item.id);
      this.getTopMovie(item.id);
      this.getSimilarMovies(item.id);
      this.getDetails(item.id);
      this.eraseCookie("id");
      this.setCookie("id", item.id, 1);
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
    getNoOfEpisodesForSelectedSeason(selectedSeason) {
      console.log(selectedSeason);
      this.episodes = [];
      this.selectedSeriesInfo.seasons.forEach((element) => {
        if (element.name === selectedSeason) {
          this.season = element.season_number;
          for (let index = 0; index < element.episode_count; index++) {
            this.episodes.push(index);
          }
        }
      });
    },
    async getDetails(id) {
      this.details = [];
      const url = "https://api.themoviedb.org/3/tv/" + id + "?language=en-US";
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
        .then((json) => {
          json.seasons.forEach((element) => {
            this.details.push({ season: element.name });
          });
          this.selectedSeriesInfo = json;
          console.log(json);
        })
        .catch((err) => console.error("error:" + err));
    },
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
  z-index: 0;
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
