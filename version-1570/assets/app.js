(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var navLinks = document.querySelector('[data-nav-links]');
  if (menuButton && navLinks) {
    menuButton.addEventListener('click', function () {
      navLinks.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var current = 0;
  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('active', i === current);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === current);
    });
  }
  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () {
      showSlide(i);
    });
  });
  if (slides.length > 1) {
    setInterval(function () {
      showSlide(current + 1);
    }, 5600);
  }

  var searchInput = document.querySelector('[data-search]');
  var yearSelect = document.querySelector('[data-year-filter]');
  var categorySelect = document.querySelector('[data-category-filter]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-title]'));
  var empty = document.querySelector('[data-empty]');
  function filterCards() {
    var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    var year = yearSelect ? yearSelect.value : '';
    var category = categorySelect ? categorySelect.value : '';
    var shown = 0;
    cards.forEach(function (card) {
      var text = [card.dataset.title, card.dataset.region, card.dataset.genre].join(' ').toLowerCase();
      var matched = true;
      if (query && text.indexOf(query) === -1) {
        matched = false;
      }
      if (year && card.dataset.year !== year) {
        matched = false;
      }
      if (category && card.dataset.genre.indexOf(category) === -1 && card.dataset.title.indexOf(category) === -1) {
        matched = false;
      }
      card.style.display = matched ? '' : 'none';
      if (matched) {
        shown += 1;
      }
    });
    if (empty) {
      empty.style.display = shown ? 'none' : 'block';
    }
  }
  [searchInput, yearSelect, categorySelect].forEach(function (el) {
    if (el) {
      el.addEventListener('input', filterCards);
      el.addEventListener('change', filterCards);
    }
  });

  var video = document.querySelector('[data-player-video]');
  var cover = document.querySelector('[data-play-cover]');
  function attachVideo() {
    if (!video) {
      return;
    }
    var source = video.dataset.src;
    if (!source) {
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({ enableWorker: true });
      hls.loadSource(source);
      hls.attachMedia(video);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else {
      video.src = source;
    }
  }
  function startVideo() {
    attachVideo();
    if (cover) {
      cover.classList.add('hidden');
    }
    var playResult = video && video.play ? video.play() : null;
    if (playResult && playResult.catch) {
      playResult.catch(function () {});
    }
  }
  if (cover && video) {
    cover.addEventListener('click', startVideo);
    video.addEventListener('click', function () {
      if (video.paused) {
        startVideo();
      }
    });
  }
})();
