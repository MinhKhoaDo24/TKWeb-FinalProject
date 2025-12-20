document.addEventListener('DOMContentLoaded', async () => {
    // 1. Lấy ID phim từ URL
    const params = new URLSearchParams(window.location.search);
    const idParam = params.get('id') ? Number(params.get('id')) : null;
    
    // Đường dẫn file (Kiểm tra xem file của bạn nằm trong thư mục data hay ở ngoài)
    const moviesPath = 'data/movies.json'; // Hoặc 'movies.json'
    const actorsPath = 'data/actors.json'; // Hoặc 'actors.json'

    const DEFAULT_PLACEHOLDER = 'https://placehold.co/1920x1080/1e1e1e/ffffff?text=No+Image';

    // --- CÁC HÀM HỖ TRỢ ---
    function formatDate(iso) {
        try {
            const d = new Date(iso);
            if (isNaN(d)) return iso;
            return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
        } catch (e) { return iso; }
    }

    function isValidUrl(url) {
        return url && typeof url === 'string' && url.trim().length > 0 && !url.includes('placehold.co');
    }

    // --- LOGIC CHÍNH ---
    try {
        // Tải dữ liệu phim
        const res = await fetch(moviesPath);
        if (!res.ok) throw new Error('Không thể tải movies.json');
        const movies = await res.json();

        // Tìm phim
        let movie = idParam ? movies.find(m => m.id === idParam) : movies[0];
        
        if (!movie) {
            document.querySelector('.main-container').innerHTML = '<div class="text-white text-center p-10">Không tìm thấy phim.</div>';
            return;
        }

        // Cập nhật Meta
        document.title = `Chi tiết - ${movie.title}`;

        // 1. Hiển thị Banner & Poster
        const bannerUrl = isValidUrl(movie.landscape_poster_url) ? movie.landscape_poster_url : (isValidUrl(movie.poster_url) ? movie.poster_url : DEFAULT_PLACEHOLDER);
        document.getElementById('banner-bg').style.backgroundImage = `url('${bannerUrl}')`;

        const posterImg = document.getElementById('poster-img');
        posterImg.src = isValidUrl(movie.poster_url) ? movie.poster_url : DEFAULT_PLACEHOLDER;
        posterImg.onerror = () => posterImg.src = DEFAULT_PLACEHOLDER;

        // 2. Điền thông tin chữ
        document.getElementById('movie-title').textContent = movie.title;
        document.getElementById('age-badge').textContent = movie.details?.age_rating || '—';
        document.getElementById('duration').textContent = movie.details?.duration_minutes ? `${movie.details.duration_minutes} phút` : '—';
        document.getElementById('release-date').textContent = movie.release_date ? formatDate(movie.release_date) : '—';
        document.getElementById('director').textContent = movie.credits?.director || '—';
        document.getElementById('country').textContent = movie.details?.country || '—';
        document.getElementById('producer').textContent = movie.details?.producer || '—';
        document.getElementById('genres').textContent = movie.genres ? movie.genres.join(', ') : '—';
        document.getElementById('vote-average').textContent = movie.vote_average || '0';
        document.getElementById('synopsis').innerHTML = movie.description ? `<p>${movie.description}</p>` : '<p class="text-gray-500">Đang cập nhật...</p>';

        // 3. XỬ LÝ DIỄN VIÊN (QUAN TRỌNG: Tải từ actors.json)
        const actorList = document.getElementById('actor-list');
        actorList.innerHTML = '<p class="text-gray-500 italic pl-2">Đang tải diễn viên...</p>';

        try {
            const resActors = await fetch(actorsPath);
            const allActors = await resActors.json();

            // Lọc những diễn viên có ID phim hiện tại trong mảng "movies" của họ
            const castMembers = allActors.filter(actor => actor.movies && actor.movies.includes(movie.id));

            actorList.innerHTML = ''; // Xóa loading

            if (castMembers.length > 0) {
                // Cách 1: Có dữ liệu trong actors.json -> Hiện ảnh đẹp
                castMembers.forEach(actor => {
                    const card = document.createElement('div');
                    card.className = 'flex items-center gap-3 bg-[#1e1e1e] p-2 rounded-xl border border-white/5 hover:bg-white/10 transition-colors cursor-pointer mb-2';
                    
                    // Nếu avatar_url lỗi hoặc trống thì dùng ảnh chữ cái
                    const avatar = isValidUrl(actor.avatar_url) ? actor.avatar_url : `https://ui-avatars.com/api/?name=${encodeURIComponent(actor.name)}&background=random&color=fff`;

                    card.innerHTML = `
                        <img src="${avatar}" alt="${actor.name}" class="w-12 h-12 rounded-full object-cover border border-white/10 shrink-0">
                        <div>
                            <h4 class="font-bold text-sm text-white">${actor.name}</h4>
                            <p class="text-xs text-gray-500">${actor.nationality || 'Diễn viên'}</p>
                        </div>
                    `;
                    actorList.appendChild(card);
                });
            } else {
                // Cách 2: Fallback (Nếu chưa có trong actors.json thì lấy tên từ movies.json)
                const simpleCast = movie.credits?.cast || [];
                if(simpleCast.length === 0) {
                    actorList.innerHTML = '<p class="text-gray-500 italic pl-2">Chưa có thông tin.</p>';
                }
                simpleCast.forEach(name => {
                    const card = document.createElement('div');
                    card.className = 'flex items-center gap-3 bg-[#1e1e1e] p-2 rounded-xl border border-white/5 mb-2 opacity-70';
                    card.innerHTML = `
                        <div class="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center border border-white/10 shrink-0 text-xs font-bold text-white">
                            ${name.charAt(0)}
                        </div>
                        <h4 class="font-bold text-sm text-white">${name}</h4>
                    `;
                    actorList.appendChild(card);
                });
            }

        } catch (errActor) {
            console.warn("Không tải được actors.json, dùng danh sách tên tạm thời.");
            // Code fallback nếu file actors.json bị lỗi
            actorList.innerHTML = '';
            (movie.credits?.cast || []).forEach(name => {
                actorList.innerHTML += `<div class="p-2 text-gray-400 border-b border-white/5">${name}</div>`;
            });
        }

        // Logic Nút Xem & Trailer
        const watchBtn = document.getElementById('btn-watch');
        if(watchBtn) watchBtn.onclick = () => window.location.href = `watch.html?id=${movie.id}`;

        const playBtn = document.getElementById('play-btn');
        if(playBtn) playBtn.onclick = () => {
            if(movie.trailer_url) window.open(movie.trailer_url, '_blank');
            else alert('Trailer chưa cập nhật');
        };

        // Kích hoạt trạng thái tim (nếu có)
        checkFavoriteStatus(movie.id);

    } catch (err) {
        console.error(err);
    }
});

// --- LOGIC YÊU THÍCH (BẠN ĐÃ CÓ) ---
function checkFavoriteStatus(movieId) {
    // ... Giữ nguyên logic cũ của bạn hoặc copy lại từ bài trước ...
    // Để code chạy, bạn cần đảm bảo biến currentMovieId được cập nhật
    window.currentMovieId = movieId; 
    const favorites = JSON.parse(localStorage.getItem('my_favorite_movies')) || [];
    const icon = document.getElementById('icon-heart-detail');
    const btn = document.getElementById('btn-favorite');
    
    if(!icon || !btn) return;

    if (favorites.includes(movieId)) {
        icon.classList.remove('text-white/50');
        icon.classList.add('text-red-500');
    } else {
        icon.classList.add('text-white/50');
        icon.classList.remove('text-red-500');
    }
}

function toggleFavoriteDetail() {
    const movieId = window.currentMovieId;
    if(!movieId) return;

    let favorites = JSON.parse(localStorage.getItem('my_favorite_movies')) || [];
    const icon = document.getElementById('icon-heart-detail');

    if (favorites.includes(movieId)) {
        favorites = favorites.filter(id => id !== movieId);
        icon.classList.remove('text-red-500');
        icon.classList.add('text-white/50');
    } else {
        favorites.push(movieId);
        icon.classList.remove('text-white/50');
        icon.classList.add('text-red-500');
    }
    localStorage.setItem('my_favorite_movies', JSON.stringify(favorites));
}