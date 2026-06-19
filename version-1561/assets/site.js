(function () {
  function normalize(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, '');
  }

  function setupMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!button || !nav) return;
    button.addEventListener('click', function () {
      nav.classList.toggle('open');
      button.classList.toggle('open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) return;
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    if (!slides.length) return;
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) window.clearInterval(timer);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupFilters() {
    var panel = document.querySelector('[data-filter-panel]');
    if (!panel) return;
    var fields = Array.prototype.slice.call(panel.querySelectorAll('[data-filter-field]'));
    var items = Array.prototype.slice.call(document.querySelectorAll('.filter-item'));
    var empty = document.querySelector('[data-empty-state]');

    function getField(name) {
      var field = panel.querySelector('[data-filter-field="' + name + '"]');
      return field ? field.value : '';
    }

    function apply() {
      var query = normalize(getField('query'));
      var year = normalize(getField('year'));
      var type = normalize(getField('type'));
      var group = normalize(getField('group'));
      var visible = 0;
      items.forEach(function (item) {
        var search = normalize(item.getAttribute('data-search'));
        var itemYear = normalize(item.getAttribute('data-year'));
        var itemType = normalize(item.getAttribute('data-type'));
        var itemGroup = normalize(item.getAttribute('data-group'));
        var matched = true;
        if (query && search.indexOf(query) === -1) matched = false;
        if (year && itemYear !== year) matched = false;
        if (type && itemType !== type) matched = false;
        if (group && itemGroup !== group) matched = false;
        item.style.display = matched ? '' : 'none';
        if (matched) visible += 1;
      });
      if (empty) empty.hidden = visible !== 0;
    }

    fields.forEach(function (field) {
      field.addEventListener('input', apply);
      field.addEventListener('change', apply);
    });
    apply();
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    players.forEach(function (box) {
      var video = box.querySelector('video');
      var cover = box.querySelector('[data-play-cover]');
      if (!video || !cover) return;
      var stream = video.getAttribute('data-stream');

      function prepare() {
        if (!stream || video.getAttribute('data-ready') === '1') return;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({ lowLatencyMode: true });
          hls.loadSource(stream);
          hls.attachMedia(video);
          box.hlsInstance = hls;
        } else {
          video.src = stream;
        }
        video.setAttribute('data-ready', '1');
      }

      function play() {
        prepare();
        box.classList.add('is-playing');
        var attempt = video.play();
        if (attempt && attempt.catch) attempt.catch(function () {});
      }

      cover.addEventListener('click', play);
      video.addEventListener('click', function () {
        if (video.paused) play();
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayers();
  });
})();
