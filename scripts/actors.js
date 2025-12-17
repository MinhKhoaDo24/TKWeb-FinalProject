async function fetchJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Cannot load ${path}: ${res.status}`);
  return res.json();
}

function normalizeText(s = "") {
  return s.toLowerCase().trim();
}

function escapeHTML(str = "") {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderActors(list) {
  const grid = document.getElementById("actors-grid");
  const count = document.getElementById("actor-count");
  count.textContent = list.length;

  grid.innerHTML = list
    .map((a) => {
      const avatar =
        a.avatar_url ||
        `https://placehold.co/400x600/111/FFF?text=${encodeURIComponent(a.name || "Actor")}`;

      return `
        <a
          href="actor_detail.html?slug=${encodeURIComponent(a.slug)}"
          class="group block rounded-2xl overflow-hidden bg-bgCard border border-white/5 hover:border-white/10 transition shadow-lg"
          title="${escapeHTML(a.name)}"
        >
          <div class="relative aspect-[2/3] overflow-hidden">
            <img
              src="${escapeHTML(avatar)}"
              alt="${escapeHTML(a.name)}"
              class="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
              loading="lazy"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent"></div>
            <div class="absolute bottom-0 left-0 right-0 p-3">
              <div class="font-semibold leading-snug line-clamp-2">${escapeHTML(a.name)}</div>
              <div class="text-xs text-gray-300 mt-1">
                ${(a.movies?.length || 0)} phim
              </div>
            </div>
          </div>
        </a>
      `;
    })
    .join("");
}

(async function main() {
  try {
    const actors = await fetchJSON("data/actors.json");
    const input = document.getElementById("actor-search");

    renderActors(actors);

    input.addEventListener("input", () => {
      const q = normalizeText(input.value);
      const filtered = actors.filter((a) =>
        normalizeText(a.name).includes(q)
      );
      renderActors(filtered);
    });
  } catch (err) {
    console.error(err);
    document.getElementById("actors-grid").innerHTML =
      `<div class="text-red-400">Lỗi tải dữ liệu diễn viên. Kiểm tra đường dẫn data/actors.json</div>`;
  }
})();
