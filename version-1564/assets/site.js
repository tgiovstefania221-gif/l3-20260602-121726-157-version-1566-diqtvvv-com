(function () {
    var mobileToggle = document.querySelector("[data-mobile-toggle]");
    var mobilePanel = document.querySelector("[data-mobile-panel]");

    if (mobileToggle && mobilePanel) {
        mobileToggle.addEventListener("click", function () {
            mobilePanel.classList.toggle("is-open");
        });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === current);
            });
        }

        function start() {
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function reset() {
            if (timer) {
                window.clearInterval(timer);
            }
            start();
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                reset();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                reset();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                reset();
            });
        }

        show(0);
        start();
    }

    function normalize(text) {
        return (text || "").toString().toLowerCase().trim();
    }

    function applyFilter(root) {
        var queryInput = root.querySelector("[data-filter-search]") || document.querySelector("[data-page-search]");
        var yearSelect = root.querySelector("[data-filter-year]");
        var typeSelect = root.querySelector("[data-filter-type]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
        var noResults = document.querySelector("[data-no-results]");
        var query = normalize(queryInput ? queryInput.value : "");
        var year = yearSelect ? yearSelect.value : "";
        var type = typeSelect ? typeSelect.value : "";
        var visible = 0;

        cards.forEach(function (card) {
            var haystack = normalize([
                card.getAttribute("data-title"),
                card.getAttribute("data-category"),
                card.getAttribute("data-tags"),
                card.getAttribute("data-type")
            ].join(" "));
            var matchQuery = !query || haystack.indexOf(query) !== -1;
            var matchYear = !year || card.getAttribute("data-year") === year;
            var matchType = !type || card.getAttribute("data-type") === type;

            if (matchQuery && matchYear && matchType) {
                card.style.display = "";
                visible += 1;
            } else {
                card.style.display = "none";
            }
        });

        if (noResults) {
            noResults.classList.toggle("is-visible", visible === 0);
        }
    }

    Array.prototype.slice.call(document.querySelectorAll("[data-filter-form], [data-page-search-form]")).forEach(function (form) {
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            applyFilter(form);
        });

        Array.prototype.slice.call(form.querySelectorAll("input, select")).forEach(function (field) {
            field.addEventListener("input", function () {
                applyFilter(form);
            });
            field.addEventListener("change", function () {
                applyFilter(form);
            });
        });
    });

    function initPlayer() {
        var video = document.querySelector("[data-player-video]");
        var startButton = document.querySelector("[data-player-start]");

        if (!video || !startButton) {
            return;
        }

        var stream = video.getAttribute("data-stream");
        var hlsInstance = null;

        function attach() {
            if (video.getAttribute("data-ready") === "1") {
                return;
            }

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = stream;
                video.setAttribute("data-ready", "1");
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    maxBufferLength: 30,
                    enableWorker: true
                });
                hlsInstance.loadSource(stream);
                hlsInstance.attachMedia(video);
                video.setAttribute("data-ready", "1");
            }
        }

        function play() {
            attach();
            startButton.classList.add("is-hidden");
            var result = video.play();
            if (result && typeof result.catch === "function") {
                result.catch(function () {});
            }
        }

        startButton.addEventListener("click", play);
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });

        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    initPlayer();
})();