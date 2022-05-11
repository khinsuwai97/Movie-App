const API_URL =
  "https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=3fd2be6f0c70a2a598f084ddfb75487c&page=1";
const IMG_PATH = "https://image.tmdb.org/t/p/w1280";
const SEARCH_API =
  'https://api.themoviedb.org/3/search/movie?api_key=3fd2be6f0c70a2a598f084ddfb75487c&query="';
const input = document.querySelector(".search_field");
const form = document.querySelector(".movie_search");
const movieCard = document.querySelector(".movie_card");
let movies;

//render error when use lost internet connection or cannot find the movie they search
const renderError = function (
  msg = "Couldn't find your movie! Please try again:💥"
) {
  movieCard.innerHTML = msg;
};
//set search movie to local storage
const setLocalStorage = function (movies) {
  localStorage.setItem("movies", JSON.stringify(movies));
};

// get seach movie local storage
const getLocalStorage = function () {
  const storage = JSON.parse(localStorage.getItem("movies")) || [];

  return storage;
};

// Get initial movies

const getMovies = async function (url) {
  try {
    const res = await fetch(url);

    if (!res.ok) throw new Error(`Movie not found${res.status}`);
    const data = await res.json();

    movies = data.results;

    if (Array.isArray(movies) && !movies.length) {
      throw new Error("Could not find your movie");
    }

    movies = movies.map((movie) => {
      return {
        poster: movie.poster_path,
        title: movie.title,
        vote: movie.vote_average,
        overview: movie.overview,
        releaseDate: movie.release_date,
        id: movie.id,
        bookmarked: true,
      };
    });

    generateMarkup(movies, true);

    getLocalStorage().push(movies);

    setLocalStorage(movies);
  } catch (err) {
    renderError(`${err.message}. Please Try again!💥`);

    throw err;
  }
};

getMovies(API_URL);

const displayMarkup = function (movie, editFlag = true) {
  const markup = `<div data-id ="${movie.id}"class="about_movie">
            <div class="movie_list">
              <h3>${movie.title}</h3>

              <button class="heart-btn">
                <i class="${
                  !editFlag ? "fa-solid fa-heart selected" : "fa-solid fa-heart"
                }"></i>
              </button>
            </div>

            <ul class="list">
              <li>
                <img
                  class="image"
                  src="${IMG_PATH}${movie.poster}" alt="${movie.title}"
                />
              </li>
              <li>
                <p>
                  <span>Title</span>
                  : ${movie.title}
                </p>
              </li>
              <li>
                <p>
                  <span>Vote</span>
                  : <span class="vote ${getColorforVoting(movie.vote)}">${
    movie.vote
  }<span>
                </p>
              </li>
              <li>
                <p>
                  <span>Release Date</span>
                  : ${movie.releaseDate}
                </p>
              </li>
               </ul>
              <div class="overview">
              <h3>Overview</h3>
              <p>${movie.overview}</p>
              </div>
           
          </div>
  `;
  movieCard.insertAdjacentHTML("afterbegin", markup);
};

const getColorforVoting = function (vote) {
  if (vote >= 8) {
    return "blue";
  } else if (vote >= 5) {
    return "orange";
  } else {
    return "red";
  }
};

const generateMarkup = function (movies) {
  movieCard.innerHTML = "";
  movies.forEach((movie) => displayMarkup(movie, true));
};

//diplay moives from local storage
getLocalStorage().forEach((movie) => displayMarkup(movie, movie.bookmarked));

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const query = input.value;
  input.value = "";
  getMovies(SEARCH_API + query);
  if (input.value === "") return;
});

// bookmark favorite movie
movieCard.addEventListener("click", function (e) {
  const movies = getLocalStorage();

  const heartbtn = e.target.closest(".heart-btn");
  if (!heartbtn) return;
  const heart = heartbtn.firstElementChild;
  const moviedata = heartbtn.closest(".about_movie");
  const id = +moviedata.dataset.id;

  heart.classList.toggle("selected");
  const movie = movies.find((movie) => movie.id === id);

  movie.bookmarked = !movie.bookmarked;

  setLocalStorage(movies);
});
