(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function initMenu() {
        var button = document.querySelector("[data-menu-button]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            var open = nav.classList.toggle("is-open");
            button.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    function initMissingImages() {
        var images = document.querySelectorAll("img[data-fallback-image]");
        images.forEach(function (image) {
            image.addEventListener("error", function () {
                image.classList.add("image-missing");
                image.removeAttribute("src");
            }, { once: true });
        });
    }

    function initHero() {
        var carousel = document.querySelector("[data-hero-carousel]");
        if (!carousel) {
            return;
        }
        var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
        if (slides.length <= 1) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                start();
            });
        });
        carousel.addEventListener("mouseenter", stop);
        carousel.addEventListener("mouseleave", start);
        start();
    }

    function initFilteringAndSorting() {
        var input = document.querySelector("[data-filter-input]");
        var select = document.querySelector("[data-sort-select]");
        var list = document.querySelector("[data-sortable-list]");
        if (!list) {
            return;
        }
        var cards = Array.prototype.slice.call(list.querySelectorAll("[data-movie-card]"));

        function applyFilter() {
            if (!input) {
                return;
            }
            var keyword = normalize(input.value);
            cards.forEach(function (card) {
                var text = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-category")
                ].join(" "));
                card.hidden = keyword && text.indexOf(keyword) === -1;
            });
        }

        function applySort() {
            if (!select) {
                return;
            }
            var value = select.value;
            var sorted = cards.slice().sort(function (a, b) {
                if (value === "views-desc") {
                    return Number(b.getAttribute("data-views")) - Number(a.getAttribute("data-views"));
                }
                if (value === "rating-desc") {
                    return Number(b.getAttribute("data-rating")) - Number(a.getAttribute("data-rating"));
                }
                if (value === "title-asc") {
                    return String(a.getAttribute("data-title")).localeCompare(String(b.getAttribute("data-title")), "zh-Hans-CN");
                }
                return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
            });
            sorted.forEach(function (card) {
                list.appendChild(card);
            });
        }

        if (input) {
            input.addEventListener("input", applyFilter);
        }
        if (select) {
            select.addEventListener("change", function () {
                applySort();
                applyFilter();
            });
        }
    }

    function attachVideo(video, status) {
        var src = video.getAttribute("data-video-src");
        if (!src) {
            if (status) {
                status.textContent = "未找到播放源。";
            }
            return;
        }
        if (video.getAttribute("data-loaded") === "true") {
            video.play().catch(function () {});
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: false
            });
            hls.loadSource(src);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                video.setAttribute("data-loaded", "true");
                if (status) {
                    status.textContent = "播放源已加载，可正常播放。";
                }
                video.play().catch(function () {});
            });
            hls.on(window.Hls.Events.ERROR, function (event, data) {
                if (status && data && data.fatal) {
                    status.textContent = "播放源加载异常，可刷新页面后重试。";
                }
            });
            return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = src;
            video.setAttribute("data-loaded", "true");
            if (status) {
                status.textContent = "浏览器原生 HLS 已接管播放。";
            }
            video.play().catch(function () {});
            return;
        }
        video.src = src;
        video.setAttribute("data-loaded", "true");
        if (status) {
            status.textContent = "已尝试直接加载播放源。";
        }
        video.play().catch(function () {});
    }

    function initPlayers() {
        var players = document.querySelectorAll("[data-player]");
        players.forEach(function (player) {
            var video = player.querySelector("video[data-video-src]");
            var trigger = player.querySelector("[data-player-trigger]");
            var status = player.querySelector("[data-player-status]");
            if (!video || !trigger) {
                return;
            }
            function start() {
                trigger.classList.add("is-hidden");
                attachVideo(video, status);
            }
            trigger.addEventListener("click", start);
            video.addEventListener("click", function () {
                if (video.getAttribute("data-loaded") !== "true") {
                    start();
                }
            });
        });
    }

    ready(function () {
        initMenu();
        initMissingImages();
        initHero();
        initFilteringAndSorting();
        initPlayers();
    });
})();
