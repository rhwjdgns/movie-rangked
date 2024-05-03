let slideIndex = 0;
let intervalId;

function showSlide(index) {
  const slides = document.querySelectorAll('.carousel-inner img');
  if (index >= slides.length) {
    slideIndex = 0;
  } else if (index < 0) {
    slideIndex = slides.length - 1;
  }
  const offset = -slideIndex * 100;
  document.querySelector('.carousel-inner').style.transform = `translateX(${offset}%)`;
}

function prevSlide() {
  slideIndex--;
  showSlide(slideIndex);
}

function nextSlide() {
  slideIndex++;
  showSlide(slideIndex);
}

setInterval(function () {
  nextSlide();
}, 8000);

showSlide(slideIndex);

// TMDB Top Rated
const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhOWFiNmViODE4MWU1MmEwODIyOWFkZTU1ZWEwYTU1ZSIsInN1YiI6IjY2MjZlNmViNjNlNmZiMDE3ZWZkMWVhMyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.OiYT8F5sTGv-kWG9PV4jADxovT2xyU4xdcCNA5ySr-A'
  }
};



// 영화 출연진 정보를 가져오는 함수
function getCastDetails(movieId) {
  return fetch(`https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=a9ab6eb8181e52a08229ade55ea0a55e&language=en-US`)
    .then(response => response.json())
    .then(data => data.cast.slice(0, 5)) // 상위 5명의 출연진 정보만 가져옴
}

// 영화 출연진 정보를 카드에 추가하는 함수
function addCastToCard(card, cast) {
  const castList = document.createElement("ul");
  castList.classList.add("cast-list");

  cast.forEach(actor => {
    const listItem = document.createElement("li");
    listItem.textContent = actor.name;
    castList.appendChild(listItem);
  });
  card.appendChild(castList);
}

// 카드생성 함수
function createMovieCard(movie) {
  const card = document.createElement("div");
  card.classList.add("card");

  // 영화 포스터 이미지를 추가합니다.
  const poster = document.createElement("img");
  poster.src = "https://image.tmdb.org/t/p/w500" + movie.poster_path;
  poster.classList.add("card-img-top");

  // 카드 본문을 추가합니다.
  const cardBody = document.createElement("div");
  cardBody.classList.add("card-body");

  // 영화 제목
  const title = document.createElement("h5");
  title.classList.add("card-title");
  title.textContent = movie.title;

  // 영화 내용
  const overview = document.createElement("p");
  overview.classList.add("card-text");
  overview.textContent = movie.overview;

  // 영화 평점
  const voteAverage = document.createElement("p");
  voteAverage.classList.add("card-average");
  voteAverage.textContent = "평점: " + movie.vote_average;

  // 영화배우 타이틀
  const castLabel = document.createElement("p");
  castLabel.classList.add("cast-label");
  castLabel.textContent = "Actor";

  // 영화배우
  const castList = document.createElement("ul");
  castList.classList.add("cast-list");

  // 상세정보 버튼
  const button = document.createElement("button");
  button.textContent = "Additional Information";
  button.classList.add("btn", "btn-primary");

  card.dataset.movieId = movie.id;

  // 출연진 정보를 가져와서 카드에 추가합니다.
  getCastDetails(movie.id)
    .then(cast => {
      movie.cast = cast;
      addCastToCard(card, cast);
    });

  // 각 요소를 카드에 추가합니다.
  card.appendChild(title);
  card.appendChild(poster);
  card.appendChild(cardBody);
  card.appendChild(voteAverage);
  card.appendChild(castLabel);
  card.appendChild(button);

  return card; // 생성된 카드를 반환합니다.
}

// 상세정보 버튼을 생성하고 클릭 이벤트를 추가하는 함수
function registerCardClickEvent() {
  const cards = document.querySelectorAll('.card');
  cards.forEach(card => {
    const detailButton = card.querySelector('.btn-primary');
    detailButton.addEventListener('click', function (event) {
      event.stopPropagation();
      const movieId = card.getAttribute('data-movie-id');
      window.location.href = 'movie_details.html?id=' + movieId;
    });
  });
}

function filterMovies(data, userInput, cardContainer) {
  // 검색어와 일치하는 영화만 필터링합니다.
  const filterMovie = data.results.filter(movie => {
    const titleMatch = movie.title.toLowerCase().includes(userInput.toLowerCase());
    const castMatch = movie.cast.some(actor => actor.name.toLowerCase().includes(userInput.toLowerCase()));
    return titleMatch || castMatch;
  });

  // 카드 컨테이너를 초기화합니다.
  cardContainer.innerHTML = '';

  // 필터링된 영화 데이터를 반복하여 카드를 생성합니다.
  filterMovie.forEach(movie => {
    const card = createMovieCard(movie);
    cardContainer.appendChild(card); // 카드를 카드 컨테이너에 추가합니다.
  });
  registerCardClickEvent();
}

// API로부터 데이터를 가져오는 fetch 요청
fetch('https://api.themoviedb.org/3/movie/top_rated?language=en-US&page=1&api_key=a9ab6eb8181e52a08229ade55ea0a55e')
  .then(response => response.json())
  .then(data => {

    // 카드 컨테이너 요소를 선택합니다.
    const cardContainer = document.querySelector("#mycards");

    // API에서 가져온 영화 데이터를 반복하여 카드를 생성합니다.
    data.results.forEach(movie => {
      const card = createMovieCard(movie);
      cardContainer.appendChild(card); // 카드를 카드 컨테이너에 추가합니다.
    });
    // 검색 이벤트
    document.getElementById("searchButton").onclick = function () {
      let userInput = document.getElementById('movieInput').value;
      filterMovies(data, userInput, cardContainer);
    }
    // 엔터키로 검색 이벤트
    document.getElementById('movieInput').addEventListener('keydown', function (event) {
      if (event.keyCode === 13) {
        let userInput = document.getElementById('movieInput').value;
        filterMovies(data, userInput, cardContainer);
      }
    });

    // 초기 카드에 클릭 이벤트를 등록합니다.
    registerCardClickEvent();
  });