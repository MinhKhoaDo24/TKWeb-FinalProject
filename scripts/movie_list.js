$(document).ready(function () {
    const params = new URLSearchParams(window.location.search);
    const genre = params.get('genre');
    const country = params.get('country');
    const type = params.get('type'); // Ví dụ: popular, trending

    const movieGrid = $("#movie-grid");
    const listTitle = $("#list-title");
    const listCount = $("#list-count");

    fetch('./data/movies.json')
        .then(res => res.json())
        .then(data => {
            let filteredMovies = data;
            let titleText = "Tất cả phim";

            // Logic lọc
            if (genre) {
                filteredMovies = data.filter(m => m.genres.includes(genre));
                titleText = `Thể loại: ${genre}`;
            } else if (country) {
                filteredMovies = data.filter(m => m.details?.country?.includes(country));
                titleText = `Quốc gia: ${country}`;
            } else if (type === 'trending') {
                titleText = "Phim Đang Thịnh Hành";
            }

            listTitle.html(`<span class="w-1.5 h-8 bg-purple-500 rounded-full mr-4"></span>${titleText}`);
            listCount.text(`Tìm thấy ${filteredMovies.length} bộ phim phù hợp`);

            renderMovies(filteredMovies);
        });

    function renderMovies(movies) {
        if (movies.length === 0) {
            movieGrid.html('<div class="col-span-full text-center py-20 text-gray-500">Không tìm thấy phim nào trong mục này.</div>');
            return;
        }

        let html = '';
        movies.forEach(m => {
            const year = m.release_date ? m.release_date.split('-')[0] : 'N/A';
            html += `
                <div class="group/card relative">
                    <a href="movie_detail.html?id=${m.id}" class="block">
                        <div class="aspect-[2/3] w-full rounded-2xl overflow-hidden bg-gray-800 mb-3 relative border border-white/5 shadow-lg">
                            <img src="${m.poster_url}" class="w-full h-full object-cover group-hover/card:scale-110 transition duration-500">
                            <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition bg-black/40">
                                <div class="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center"><i class="fa-solid fa-play text-white"></i></div>
                            </div>
                        </div>
                        <h4 class="font-bold truncate text-sm text-gray-200 group-hover:text-purple-400 transition">${m.title}</h4>
                        <div class="flex items-center justify-between text-[11px] text-gray-500 mt-1">
                            <span>${year}</span>
                            <span class="text-yellow-500"><i class="fa-solid fa-star mr-1"></i>${m.vote_average}</span>
                        </div>
                    </a>
                </div>`;
        });
        movieGrid.html(html);
    }
});