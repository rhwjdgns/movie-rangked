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
    let star_img = ["⭐", "⭐⭐", "⭐⭐⭐", "⭐⭐⭐⭐", "⭐⭐⭐⭐⭐"];
    let a = localStorage.getItem(movieId).split("&&");
    let review_name_list = a.filter((item, pos) => a.indexOf(item) === pos); //중복 제거
    review_name_list.map((name) => {
        let review_name_write = name.split("&")[0];
        let review_name_star = star_img[localStorage.getItem(name).split("&")[2] - 1];
        let review_content_write = localStorage.getItem(name).split("&")[0];
        let review_html = `<a class="list-group-item list-group-item-action">${review_name_write} : ${review_content_write} : ${review_name_star}
        
        <button id="${name}" onclick="list_del(this.id)" type="button" class="btn-position btn-close" aria-label="Close"></button>
        <div class="dropdown">
            <button type="button" class="btn btn-primary dropdown-toggle" data-bs-toggle="dropdown"
                aria-expanded="false" data-bs-auto-close="outside">
                수정
            </button>
            <form class="dropdown-menu p-4" id="${name}review_modify">
                <div class="mb-3">
                    <label for="re_review_content" class="form-label">변경 내용</label>
                    <input type="text" class="form-control" id="re_review_content" placeholder="내용 입력">
                </div>
                <div class="mb-3">
                <label for="re_review_star" class="form-label">별점</label>
                <select id="re_review_star" class="form-select form-select-sm" aria-label="Small select example">
                <option selected value="5">⭐⭐⭐⭐⭐</option>
                <option value="4">⭐⭐⭐⭐</option>
                <option value="3">⭐⭐⭐</option>
                <option value="2">⭐⭐</option>
                <option value="1">⭐</option>
            </select>
                </div>
                <div class="mb-3">
                    <label for="re_review_password" class="form-label">비밀번호</label>
                    <input type="password" class="form-control" id="re_review_password" placeholder="Password">
                </div>
                <button id="${name}" onclick="review_modify(this.id)" type="button"
                    class="btn btn-primary">변경하기</button>
            </form>
        </div>
        </a>`;
        let element = document.getElementById("review_list");
        element.innerHTML += review_html;
    });
    let re_review_name_list = review_name_list.join("&&");
    localStorage.setItem(movieId, re_review_name_list);
}

//리뷰 적은 내용 스토리지에 저장 하고 새로고침

function record_review() {
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('id');

    let review_name = document.getElementById('review_name').value;
    let review_content = document.getElementById('review_content').value;
    let review_password = document.getElementById('review_password').value;
    let review_star = document.getElementById('movie_star').value;



    let name_list = localStorage.getItem(movieId)
    let verdict = false;

    if (!document.getElementById('review_name').value) {//입력 안할시 반환
        alert("아이디를 입력해 주세요.");
        return
    }
    else if (!document.getElementById('review_content').value) {
        alert("내용을 입력해 주세요.")
        return
    }
    else if (!document.getElementById('review_password').value) {
        alert("비밀번호를 입력해 주세요.")
        return
    }

    if (name_list == null) {//작성한 리뷰가 있는지 판별

    } else {
        verdict = name_list.split("&&").includes(review_name + "&" + movieId)
    }

    if (verdict == true) { //리뷰가 이미 있을시 안내 없을 시 저장
        alert("이미 작성한 리뷰가 있습니다.")
    } else {
        if (name_list == null) {
            localStorage.setItem(movieId, review_name + "&" + movieId);
            localStorage.setItem(review_name + "&" + movieId, review_content + "&" + review_password + "&" + review_star);
        } else {
            localStorage.setItem(movieId, [name_list + "&&" + review_name + "&" + movieId]);
            localStorage.setItem(review_name + "&" + movieId, review_content + "&" + review_password + "&" + review_star);
        }

    }

    location.reload();

}

function list_del(name_id) { //리스트에서 삭제 함수
    let input_password = prompt("리뷰작성시 입력한 비밀번호를 입력해 주세요.");

    if (input_password == localStorage.getItem(name_id).split("&")[1]) {
        let person_movieId = name_id.split("&")[1];
        let movie_id_del = localStorage.getItem(person_movieId).split("&&");
        let re_movie_id = movie_id_del.filter((element) => element !== name_id)
        localStorage.removeItem(name_id);

        if (re_movie_id.length == 0) {
            localStorage.removeItem(person_movieId);
        } else {
            localStorage.setItem(person_movieId, re_movie_id.join("&&"));
        }
        alert("삭제가 완료되었습니다.")
    }
    else (
        alert("비밀번호가 일치하지 않습니다.")
    )

    location.reload();
}

function review_modify(name_id) { //내용 수정시 함수

    let re_review_content = document.getElementById(name_id + "review_modify").elements[0].value;
    let re_review_star = document.getElementById(name_id + "review_modify").elements[1].value;
    let re_review_password = document.getElementById(name_id + "review_modify").elements[2].value;
    let current_password = localStorage.getItem(name_id).split("&")[1];

    if (!re_review_content) {
        alert("내용을 입력해 주세요.");
    } else if (!re_review_password) {
        alert("비밀번호를 입력해 주세요.");
    } else {
        if (re_review_password == current_password) {
            localStorage.setItem(name_id, re_review_content + "&" + current_password + "&" + re_review_star);
            alert("수정 완료");
            location.reload();
        }
        else {
            alert("비밀번호가 일치하지 않습니다.");
        }

    }

}