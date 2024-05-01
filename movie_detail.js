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
        
};
