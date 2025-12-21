document.addEventListener("DOMContentLoaded", () => {
  // --- 1. Cấu hình các phần tử giao diện ---
  const KEY = "watch_history_v1";
  const listEl = document.getElementById("history-list");
  const emptyEl = document.getElementById("history-empty");
  const countEl = document.getElementById("history-count");
  const searchEl = document.getElementById("history-search");
  const clearBtn = document.getElementById("btn-clear");

  const DEFAULT_THUMB = "https://placehold.co/640x360/1e1e1e/ffffff?text=No+Image";

  // --- 2. Các hàm tiện ích ---
  function safeText(v) {
    return (v ?? "").toString();
  }

  // Hàm định dạng thời gian (Ví dụ: 20/12/2025, 03:37)
  function formatTime(ts) {
    try {
      const d = new Date(ts);
      if (isNaN(d)) return "";
      const dd = String(d.getDate()).padStart(2, "0");
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const yyyy = d.getFullYear();
      const hh = String(d.getHours()).padStart(2, "0");
      const mi = String(d.getMinutes()).padStart(2, "0");
      return `${dd}/${mm}/${yyyy}, ${hh}:${mi}`;
    } catch {
      return "";
    }
  }

  // Lấy dữ liệu lịch sử từ bộ nhớ trình duyệt
  function getHistory() {
    try {
      const raw = localStorage.getItem(KEY);
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  }

  // Lưu dữ liệu lịch sử mới vào bộ nhớ
  function setHistory(arr) {
    localStorage.setItem(KEY, JSON.stringify(arr));
  }

  // --- 3. Logic chính: Hiển thị giao diện ---
  function render(items) {
    // SỬ DỤNG FILE AUTH.JS: Gọi hàm protectContent để tự động chặn nếu chưa đăng nhập
    if (typeof window.protectContent === 'function') {
        const isAuthorized = window.protectContent("history-list", "history-empty");
        if (!isAuthorized) {
            if (countEl) countEl.textContent = "0";
            if (clearBtn) clearBtn.style.display = "none";
            return; // Dừng render nếu chưa đăng nhập
        }
    }

    // Nếu đã đăng nhập: Tiến hành hiển thị danh sách
    listEl.innerHTML = "";
    countEl.textContent = String(items.length);
    
    // Hiện/Ẩn nút xóa tất cả dựa trên số lượng phim
    if (clearBtn) clearBtn.style.display = items.length > 0 ? "flex" : "none";

    if (!items.length) {
      // Trường hợp danh sách trống
      emptyEl.innerHTML = `
        <div class="col-span-full flex flex-col items-center justify-center py-20 text-gray-500">
            <div class="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/10">
                <i class="fa-solid fa-clock-rotate-left text-gray-600 text-2xl"></i>
            </div>
            <p class="text-lg">Danh sách lịch sử của bạn đang trống.</p>
        </div>
      `;
      emptyEl.style.display = "block";
      emptyEl.classList.remove("hidden");
      return;
    }

    emptyEl.style.display = "none";
    listEl.className = "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6";

    items.forEach((it) => {
      const id = it?.id;
      const title = safeText(it?.title) || "Không có tiêu đề";
      const thumb = (it?.poster_url && safeText(it.poster_url).trim()) || DEFAULT_THUMB;
      const vote = it?.vote_average || "0";
      const genre = it?.genres ? it.genres[0] : "Phim";
      const watchedAt = it?.watched_at ? formatTime(it.watched_at) : ""; 

      const card = document.createElement("div");
      card.className = "relative group/card history-item-card animate-fadeIn";
      
      card.innerHTML = `
          <div class="relative block cursor-pointer">
              <div class="aspect-[2/3] w-full rounded-[1.5rem] overflow-hidden bg-gray-800 mb-3 relative border border-white/5 shadow-lg transition-all duration-300">
                  <img src="${thumb}" loading="lazy" class="w-full h-full object-cover group-hover/card:scale-110 transition duration-500 opacity-90 group-hover/card:opacity-100">
                  
                  <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition duration-300 bg-black/40 backdrop-blur-[2px]" onclick="window.location.href='movie_detail.html?id=${id}'">
                      <div class="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition">
                          <i class="fa-solid fa-play text-white text-sm ml-1"></i>
                      </div>
                  </div>

                  <button class="remove-quick-btn absolute top-2 right-2 w-8 h-8 rounded-full bg-[#e15b5b] hover:bg-red-600 text-white flex items-center justify-center transition-all z-20 shadow-xl active:scale-90" title="Xóa khỏi lịch sử">
                      <i class="fa-solid fa-xmark text-sm font-bold"></i>
                  </button>
                  
                  <div class="absolute top-2 left-2 px-1.5 py-0.5 bg-primary/80 backdrop-blur-md rounded text-[9px] font-black text-white shadow-lg uppercase tracking-tighter">HD</div>
              </div>

              <div class="px-1">
                  <h4 class="font-bold truncate text-base text-gray-200 group-hover/card:text-purple-400 transition mb-1 uppercase tracking-tight" title="${title}">${title}</h4>
                  
                  <div class="flex items-center justify-between text-[10px] text-gray-500 font-medium mb-1.5">
                      <span>${genre}</span>
                      <span class="flex items-center gap-1 opacity-70 italic">
                        <i class="fa-regular fa-clock text-[8px]"></i> ${watchedAt}
                      </span>
                  </div>
                  
                  <div class="flex justify-end">
                      <div class="flex items-center gap-1 bg-[#322c15] text-[#fbbf24] px-1.5 py-0.5 rounded border border-[#fbbf24]/20 text-[10px] font-black">
                          <i class="fa-solid fa-star text-[8px]"></i>
                          <span>${vote}</span>
                      </div>
                  </div>
              </div>
          </div>
      `;

      // Xử lý xóa từng phim
      const delBtn = card.querySelector(".remove-quick-btn");
      delBtn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation(); 
          const all = getHistory();
          const updated = all.filter(item => item.id !== id);
          setHistory(updated);
          render(updated);
      });

      // Điều hướng đến trang chi tiết
      card.querySelector("h4").addEventListener("click", () => {
          window.location.href = `movie_detail.html?id=${id}`;
      });

      listEl.appendChild(card);
    });
  }

  // --- 4. Xử lý các sự kiện người dùng ---

  // Lọc phim theo tìm kiếm (Sử dụng hàm checkIsLoggedIn từ auth.js)
  function applyFilter() {
    if (typeof window.checkIsLoggedIn === 'function' && !window.checkIsLoggedIn()) return;

    const q = safeText(searchEl.value).trim().toLowerCase();
    const all = getHistory();
    if (!q) return render(all);

    const filtered = all.filter(it => safeText(it?.title).toLowerCase().includes(q));
    render(filtered);
  }

  // Khởi tạo ban đầu
  render(getHistory());

  // Lắng nghe tìm kiếm
  searchEl.addEventListener("input", applyFilter);

  // Nút xóa tất cả (Sử dụng hàm checkIsLoggedIn từ auth.js)
  clearBtn.addEventListener("click", () => {
    if (typeof window.checkIsLoggedIn === 'function' && !window.checkIsLoggedIn()) return;

    const ok = confirm("Bạn có chắc chắn muốn xóa toàn bộ lịch sử xem?");
    if (!ok) return;
    setHistory([]);
    render([]);
  });
});