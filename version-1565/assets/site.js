const MovieSite = (() => {
    let hlsPromise = null;

    function bindMobileMenu() {
        const button = document.querySelector("[data-menu-toggle]");
        const panel = document.querySelector("[data-mobile-panel]");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", () => {
            panel.classList.toggle("is-open");
        });
    }

    function bindHeroSlider() {
        const slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        const slides = Array.from(slider.querySelectorAll(".hero-slide"));
        const dots = Array.from(document.querySelectorAll("[data-hero-dot]"));
        const next = document.querySelector("[data-hero-next]");
        const prev = document.querySelector("[data-hero-prev]");
        if (!slides.length) {
            return;
        }
        let active = 0;
        let timer = null;
        const show = (index) => {
            active = (index + slides.length) % slides.length;
            slides.forEach((slide, i) => slide.classList.toggle("is-active", i === active));
            dots.forEach((dot, i) => dot.classList.toggle("is-active", i === active));
        };
        const restart = () => {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(() => show(active + 1), 5200);
        };
        dots.forEach((dot, index) => {
            dot.addEventListener("click", () => {
                show(index);
                restart();
            });
        });
        if (next) {
            next.addEventListener("click", () => {
                show(active + 1);
                restart();
            });
        }
        if (prev) {
            prev.addEventListener("click", () => {
                show(active - 1);
                restart();
            });
        }
        restart();
    }

    function bindFilters() {
        document.querySelectorAll("[data-filter-form]").forEach((form) => {
            const grid = document.querySelector(form.getAttribute("data-filter-form"));
            const empty = document.querySelector(form.getAttribute("data-empty-target"));
            if (!grid) {
                return;
            }
            const cards = Array.from(grid.querySelectorAll(".movie-card"));
            const apply = () => {
                const keyword = (form.querySelector("[data-filter-keyword]")?.value || "").trim().toLowerCase();
                const region = form.querySelector("[data-filter-region]")?.value || "";
                const year = form.querySelector("[data-filter-year]")?.value || "";
                let visible = 0;
                cards.forEach((card) => {
                    const haystack = (card.getAttribute("data-title") + " " + card.getAttribute("data-genre") + " " + card.getAttribute("data-tags")).toLowerCase();
                    const okKeyword = !keyword || haystack.includes(keyword);
                    const okRegion = !region || card.getAttribute("data-region") === region;
                    const okYear = !year || card.getAttribute("data-year") === year;
                    const show = okKeyword && okRegion && okYear;
                    card.style.display = show ? "" : "none";
                    if (show) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            };
            form.addEventListener("input", apply);
            form.addEventListener("change", apply);
        });
    }

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function setupSearchPage() {
        const grid = document.querySelector("[data-search-results]");
        const title = document.querySelector("[data-search-title]");
        if (!grid || typeof MOVIE_SEARCH_INDEX === "undefined") {
            return;
        }
        const params = new URLSearchParams(location.search);
        const q = (params.get("q") || "").trim();
        const normalized = q.toLowerCase();
        let list = MOVIE_SEARCH_INDEX;
        if (normalized) {
            list = list.filter((movie) => {
                const haystack = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.description, movie.category, movie.tags.join(" ")].join(" ").toLowerCase();
                return haystack.includes(normalized);
            });
        } else {
            list = list.slice(0, 72);
        }
        if (title) {
            title.textContent = q ? `“${q}” 相关影片` : "精选影片搜索";
        }
        if (!list.length) {
            grid.innerHTML = '<div class="empty-note is-visible">没有找到匹配影片</div>';
            return;
        }
        grid.innerHTML = list.slice(0, 120).map((movie) => {
            const tags = movie.tags.slice(0, 3).map((tag) => `<span>${escapeHtml(tag)}</span>`).join("");
            return `
                <a class="movie-card" href="${escapeHtml(movie.url)}" data-title="${escapeHtml(movie.title)}" data-region="${escapeHtml(movie.region)}" data-year="${escapeHtml(movie.year)}" data-genre="${escapeHtml(movie.genre)}" data-tags="${escapeHtml(movie.tags.join(" "))}">
                    <div class="movie-cover">
                        <img src="${escapeHtml(movie.cover)}" alt="${escapeHtml(movie.title)} 在线观看" loading="lazy">
                        <span class="movie-badge">${escapeHtml(movie.type)}</span>
                        <span class="movie-score">${escapeHtml(movie.year)}</span>
                        <span class="cover-shade"></span>
                    </div>
                    <div class="movie-body">
                        <h3>${escapeHtml(movie.title)}</h3>
                        <p>${escapeHtml(movie.description)}</p>
                        <div class="movie-meta">
                            <span>${escapeHtml(movie.region)}</span>
                            <span>${escapeHtml(movie.category)}</span>
                        </div>
                        <div class="tags">${tags}</div>
                    </div>
                </a>
            `;
        }).join("");
    }

    function loadHls() {
        if (window.Hls) {
            return Promise.resolve(window.Hls);
        }
        if (!hlsPromise) {
            hlsPromise = new Promise((resolve) => {
                const script = document.createElement("script");
                script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js";
                script.onload = () => resolve(window.Hls || null);
                script.onerror = () => resolve(null);
                document.head.appendChild(script);
            });
        }
        return hlsPromise;
    }

    function safePlay(video) {
        const task = video.play();
        if (task && typeof task.catch === "function") {
            task.catch(() => {});
        }
    }

    async function attachAndPlay(video, url) {
        if (video.dataset.ready === url) {
            safePlay(video);
            return;
        }
        video.dataset.ready = url;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = url;
            safePlay(video);
            return;
        }
        const HlsClass = await loadHls();
        if (HlsClass && HlsClass.isSupported()) {
            const hls = new HlsClass({ enableWorker: true });
            hls.loadSource(url);
            hls.attachMedia(video);
            hls.on(HlsClass.Events.MANIFEST_PARSED, () => safePlay(video));
            return;
        }
        video.src = url;
        safePlay(video);
    }

    function player(videoId, layerId, url) {
        const video = document.getElementById(videoId);
        const layer = document.getElementById(layerId);
        if (!video || !layer || !url) {
            return;
        }
        const begin = () => {
            layer.classList.add("is-hidden");
            attachAndPlay(video, url);
        };
        layer.addEventListener("click", begin);
        video.addEventListener("click", () => {
            if (video.paused) {
                begin();
            }
        });
    }

    document.addEventListener("DOMContentLoaded", () => {
        bindMobileMenu();
        bindHeroSlider();
        bindFilters();
        setupSearchPage();
    });

    return { player };
})();

window.MovieSite = MovieSite;
