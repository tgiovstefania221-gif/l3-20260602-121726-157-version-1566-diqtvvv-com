(function() {
  const menuButton = document.querySelector("[data-menu-toggle]");
  const mobileNav = document.querySelector("[data-mobile-nav]");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function() {
      mobileNav.classList.toggle("open");
    });
  }

  const slides = Array.from(document.querySelectorAll(".hero-slide"));
  const dots = Array.from(document.querySelectorAll(".hero-dot"));
  const previousButton = document.querySelector("[data-hero-prev]");
  const nextButton = document.querySelector("[data-hero-next]");
  let current = 0;
  let timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;

    slides.forEach(function(slide, slideIndex) {
      slide.classList.toggle("active", slideIndex === current);
    });

    dots.forEach(function(dot, dotIndex) {
      dot.classList.toggle("active", dotIndex === current);
    });
  }

  function startTimer() {
    if (timer || slides.length < 2) {
      return;
    }

    timer = window.setInterval(function() {
      showSlide(current + 1);
    }, 5200);
  }

  function resetTimer() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
    startTimer();
  }

  dots.forEach(function(dot, index) {
    dot.addEventListener("click", function() {
      showSlide(index);
      resetTimer();
    });
  });

  if (previousButton) {
    previousButton.addEventListener("click", function() {
      showSlide(current - 1);
      resetTimer();
    });
  }

  if (nextButton) {
    nextButton.addEventListener("click", function() {
      showSlide(current + 1);
      resetTimer();
    });
  }

  showSlide(0);
  startTimer();

  const searchInputs = Array.from(document.querySelectorAll(".site-search"));

  searchInputs.forEach(function(input) {
    const scope = input.closest("main") || document;
    const targets = Array.from(scope.querySelectorAll(".movie-card, .rank-row"));
    const emptyState = scope.querySelector(".empty-state");

    input.addEventListener("input", function() {
      const keyword = input.value.trim().toLowerCase();
      let visibleCount = 0;

      targets.forEach(function(item) {
        const haystack = [
          item.getAttribute("data-title") || "",
          item.getAttribute("data-year") || "",
          item.getAttribute("data-genre") || "",
          item.textContent || ""
        ].join(" ").toLowerCase();

        const matched = !keyword || haystack.indexOf(keyword) !== -1;
        item.style.display = matched ? "" : "none";
        if (matched) {
          visibleCount += 1;
        }
      });

      if (emptyState) {
        emptyState.style.display = visibleCount === 0 ? "block" : "none";
      }
    });
  });
})();
