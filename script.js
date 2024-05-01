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

  const title = document.createElement("h5");
  title.classList.add("card-title");
  title.textContent = movie.title;

  const overview = document.createElement("p");
  overview.classList.add("card-text");
  overview.textContent = movie.overview;

  const voteAverage = document.createElement("p");
  voteAverage.classList.add("card-average");
  voteAverage.textContent = "평점: " + movie.vote_average;

  const castLabel = document.createElement("p");
  castLabel.classList.add("cast-label");
  castLabel.textContent = "Actor";

  const button = document.createElement("button");
  button.textContent = "Additional Information";
  button.classList.add("btn", "btn-primary");

  const castList = document.createElement("ul");
  castList.classList.add("cast-list");

  // 영화 출연진 정보를 가져와서 카드에 추가합니다.
  getCastDetails(movie.id)
    .then(cast => {
      movie.cast = cast;
      cast.forEach(actor => {
        const listItem = document.createElement("li");
        listItem.textContent = actor.name;
        castList.appendChild(listItem);
      });
    });

  card.dataset.movieId = movie.id;

  // 각 요소를 카드에 추가합니다.
  card.appendChild(title);
  card.appendChild(poster);
  card.appendChild(overview);
  card.appendChild(cardBody);
  card.appendChild(voteAverage);
  card.appendChild(castLabel);
  card.appendChild(castList);
  card.appendChild(button);



  return card; // 생성된 카드를 반환합니다.
}

// 클릭 이벤트를 등록하는 함수
function registerCardClickEvent() {
  // 카드 요소를 가져옵니다.
  const cards = document.querySelectorAll('.card');
  // 각 카드에 대해 클릭 이벤트를 추가합니다.
  cards.forEach(card => {
    card.addEventListener('click', function () {
      // 카드에 설정된 데이터 속성인 'data-movie-id'를 사용하여 영화 ID를 가져옵니다.
      const movieId = this.getAttribute('data-movie-id');

      // 해당 영화의 ID를 사용하여 새로운 페이지로 이동합니다.
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