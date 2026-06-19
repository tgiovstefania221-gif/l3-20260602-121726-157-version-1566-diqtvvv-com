(function () {
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('.hero-slide'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let current = 0;
    let timer = null;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function startAuto() {
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    function resetAuto() {
      if (timer) {
        window.clearInterval(timer);
      }
      startAuto();
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        resetAuto();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        resetAuto();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.dataset.heroDot || 0));
        resetAuto();
      });
    });

    startAuto();
  }

  const filterInputs = Array.from(document.querySelectorAll('[data-filter-input]'));

  filterInputs.forEach(function (input) {
    input.addEventListener('input', function () {
      const value = input.value.trim().toLowerCase();
      const cards = Array.from(document.querySelectorAll('[data-title]'));

      cards.forEach(function (card) {
        const text = [
          card.dataset.title,
          card.dataset.year,
          card.dataset.region,
          card.dataset.genre
        ].join(' ').toLowerCase();

        if (!value || text.indexOf(value) !== -1) {
          card.removeAttribute('hidden-by-filter');
        } else {
          card.setAttribute('hidden-by-filter', '');
        }
      });
    });
  });
})();
