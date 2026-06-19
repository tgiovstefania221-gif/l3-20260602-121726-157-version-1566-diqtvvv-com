(function () {
    const nav = document.querySelector('.site-nav');
    const navToggle = document.querySelector('.nav-toggle');

    if (nav && navToggle) {
        navToggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('.site-search').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            const input = form.querySelector('input[name="q"]');
            const keyword = input ? input.value.trim() : '';
            const root = form.getAttribute('data-root') || '';
            if (keyword) {
                window.location.href = root + 'search.html?q=' + encodeURIComponent(keyword);
            }
        });
    });

    const hero = document.querySelector('[data-hero-slider]');
    if (hero) {
        const slides = Array.from(hero.querySelectorAll('.hero-slide'));
        const dots = Array.from(document.querySelectorAll('.hero-dots button'));
        let current = 0;

        const activate = function (index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        };

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                activate(Number(dot.getAttribute('data-slide') || 0));
            });
        });

        window.setInterval(function () {
            activate(current + 1);
        }, 5200);
    }

    const filterInput = document.querySelector('.page-filter');
    if (filterInput) {
        const cards = Array.from(document.querySelectorAll('[data-search]'));
        const counter = document.querySelector('.result-counter');
        const params = new URLSearchParams(window.location.search);
        const initialQuery = params.get('q') || '';

        const runFilter = function () {
            const keyword = filterInput.value.trim().toLowerCase();
            let total = 0;
            cards.forEach(function (card) {
                const haystack = (card.getAttribute('data-search') || '').toLowerCase();
                const matched = !keyword || haystack.indexOf(keyword) !== -1;
                card.classList.toggle('is-hidden-by-filter', !matched);
                if (matched) {
                    total += 1;
                }
            });
            if (counter) {
                counter.textContent = total + ' 条内容';
            }
        };

        if (initialQuery) {
            filterInput.value = initialQuery;
        }

        filterInput.addEventListener('input', runFilter);
        runFilter();
    }
})();
