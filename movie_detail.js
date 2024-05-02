window.onload = function () {
    // URL에서 영화 ID를 가져옵니다.
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('id');

    // 영화 상세 정보를 가져오는 API 요청
    fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=a9ab6eb8181e52a08229ade55ea0a55e&language=en-US`)
        .then(response => response.json())
        .then(data => {
            // 영화 정보를 HTML에 표시합니다.
            document.getElementById('movie-title').textContent = data.title;
            document.getElementById('movie-overview').textContent = data.overview;
            document.getElementById('movie-release-date').textContent = "개봉일자: " + data.release_date;
            document.getElementById('movie-runtime').textContent = "상영시간: " + data.runtime + "분";

            document.getElementById('movie-rating').textContent = "평점: " + data.vote_average;

            // 장르 정보를 가져와서 표시합니다.
            const genres = data.genres.map(genre => genre.name).join(', ');
            document.getElementById('movie-genres').textContent = "장르: " + genres;

            // 제작 국가 정보를 가져와서 표시합니다.
            const countries = data.production_countries.map(country => country.name).join(', ');
            document.getElementById('movie-countries').textContent = "제작 국가: " + countries;

             // 관람 관객 수 정보를 가져와서 표시합니다. (TMDB API에는 해당 정보가 없을 수 있습니다.)
        const revenue = data.revenue;
        let audience;
        if (revenue) {
            if (revenue >= 100000000) {
                audience = Math.round(revenue / 100000000) + "억 명";
            } else if (revenue >= 10000000) {
                audience = Math.round(revenue / 10000000) + "천만 명";
            } else if (revenue >= 1000000) {
                audience = Math.round(revenue / 1000000) + "백만 명";
            }
        } else {
            audience = "정보 없음";
        }
        document.getElementById('movie-audience').textContent = "누적 관람 관객 수: " + audience;


            // 영화 포스터 이미지를 표시합니다.
            const poster = document.createElement("img");
            poster.src = "https://image.tmdb.org/t/p/w500" + data.poster_path;
            poster.alt = data.title + " 포스터";
            document.getElementById('poster-container').appendChild(poster);

            // 영화 출연진 정보를 가져오는 API 요청
            fetch(`https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=a9ab6eb8181e52a08229ade55ea0a55e&language=en-US`)
                .then(response => response.json())
                .then(data => {
                    // 영화 출연진 정보 중에서 상위 몇 명만 가져와서 표시합니다.
                    const cast = data.cast.slice(0, 20);
                    const castList = document.getElementById('movie-cast');

                    cast.forEach(actor => {
                        // 각 배우의 상세 정보를 가져오는 API 요청
                        fetch(`https://api.themoviedb.org/3/person/${actor.id}?api_key=a9ab6eb8181e52a08229ade55ea0a55e&language=en-US`)
                            .then(response => response.json())
                            .then(actorData => {
                                if (actorData.profile_path) {
                                    const actorImage = document.createElement("img");
                                    actorImage.src = "https://image.tmdb.org/t/p/w500" + actorData.profile_path;
                                    actorImage.alt = actorData.name + " 사진";
                                    castList.appendChild(actorImage);
                                }

                                // 배우의 이름과 역할을 표시합니다.
                                const actorInfo = document.createElement("p");
                                actorInfo.textContent = `${actorData.name} (${actor.character})`;
                                castList.appendChild(actorInfo);
                            })
                            .catch(error => console.log('Error fetching actor details:', error));
                    });
                })
                .catch(error => console.log('Error fetching cast details:', error));

            // 영화 감독 정보를 가져오는 API 요청
            fetch(`https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=a9ab6eb8181e52a08229ade55ea0a55e&language=en-US`)
                .then(response => response.json())
                .then(data => {
                    // 첫 번째 감독의 이름을 가져와서 HTML에 표시합니다.
                    const directorName = data.crew.find(member => member.job === "Director");
                    if (directorName) {
                        document.getElementById('movie-director').textContent = "감독: " + directorName.name;
                    } else {
                        document.getElementById('movie-director').textContent = "감독 정보 없음";
                    }
                })
                .catch(error => console.log('Error fetching director details:', error));

            return fetch(`https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=a9ab6eb8181e52a08229ade55ea0a55e&language=en-US`);
        })

    make_review(movieId);

};

//리뷰 이름 목록화하고 이름 순서대로 리뷰 생성
function make_review(movieId) {
    let a = localStorage.getItem(movieId).split("&&");
    let review_name_list = a.filter((item, pos) => a.indexOf(item) === pos);
    review_name_list.map((name) => {
        let review_name_write = name.split("&")[0];
        let review_content_write = localStorage.getItem(name).split("&")[0];
        let review_html = `<a href="#" class="list-group-item list-group-item-action">${review_name_write} : ${review_content_write}</a>`;
        let element = document.getElementById("review_list");
        element.innerHTML += review_html;
    });
}

//리뷰 적은 내용 스토리지에 저장 하고 새로고침

function record_review() {
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('id');

    let review_name = document.getElementById('review_name').value;
    let review_content = document.getElementById('review_content').value;
    let review_password = document.getElementById('review_password').value;
    let name_list = localStorage.getItem(movieId);


    if (name_list === null) {
        localStorage.setItem(movieId, [review_name + "&" + movieId]);
        localStorage.setItem(review_name + "&" + movieId, review_content + "&" + review_password);
    } else {
        localStorage.setItem(movieId, [name_list + "&&" + review_name + "&" + movieId]);
        localStorage.setItem(review_name + "&" + movieId, review_content + "&" + review_password);
    }

    location.reload();
}
