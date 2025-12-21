// HÀN KIỂM TRA ĐĂNG KÝ, ĐĂNG NHẬP VẠN NĂNG
// 1. Hàm kiểm tra trạng thái đăng nhập (Trả về true/false)
window.checkIsLoggedIn = function() {
    return localStorage.getItem("isLoggedIn") === "true";
};

// 2. Hàm bảo vệ trang (Nếu chưa đăng nhập sẽ ẩn nội dung và hiện thông báo khóa)
window.protectContent = function(listId, emptyId) {
    const listEl = document.getElementById(listId);
    const emptyEl = document.getElementById(emptyId);
    const isLoggedIn = window.checkIsLoggedIn();

    if (!isLoggedIn) {
        if (listEl) listEl.innerHTML = ""; // Xóa sạch danh sách nếu có
        if (emptyEl) {
            emptyEl.innerHTML = `
                <div class="col-span-full flex flex-col items-center justify-center py-20 text-gray-500">
                    <div class="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/10">
                        <i class="fa-solid fa-lock text-purple-500 text-2xl"></i>
                    </div>
                    <p class="text-lg font-bold text-white uppercase tracking-tight">Quyền truy cập bị hạn chế</p>
                    <p class="text-sm text-gray-400 mt-2">Vui lòng đăng nhập để xem lại dữ liệu cá nhân của bạn.</p>
                    <a href="login.html" class="mt-6 px-8 py-3 bg-gradient-brand rounded-full hover:scale-105 transition text-white text-[11px] font-bold uppercase shadow-lg shadow-purple-500/20">Đăng nhập ngay</a>
                </div>
            `;
            emptyEl.style.display = "block";
            emptyEl.classList.remove("hidden");
        }
        return false; // Trạng thái: Chưa đăng nhập
    }
    return true; // Trạng thái: Đã đăng nhập
};