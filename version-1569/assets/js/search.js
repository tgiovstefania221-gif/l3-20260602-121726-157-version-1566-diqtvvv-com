(function () {
  var state = {
    movies: [],
    query: '',
    type: '',
    year: '',
    region: ''
  };

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function uniqueOptions(items, key) {
    var seen = {};
    return items.map(function (item) {
      return item[key];
    }).filter(function (value) {
      if (!value || seen[value]) {
        return false;
      }
      seen[value] = true;
      return true;
    }).sort(function (a, b) {
      return String(b).localeCompare(String(a), 'zh-CN');
    });
  }

  function createCard(movie) {
    var tags = movie.tags.slice(0, 3).map(function (tag) {
      return '<span class="badge badge-secondary text-xs">' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<a class="card card-hover movie-card" href="' + escapeHtml(movie.url) + '">',
      '  <div class="poster-frame">',
      '    <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '    <span class="card-badge">' + escapeHtml(movie.type) + '</span>',
      '    <span class="poster-shade"><span class="play-bubble">▶</span></span>',
      '  </div>',
      '  <div class="movie-body">',
      '    <h3 class="movie-title line-clamp-2">' + escapeHtml(movie.title) + '</h3>',
      '    <div class="movie-meta">',
      '      <span>' + escapeHtml(movie.region) + '</span>',
      '      <span>' + escapeHtml(movie.year) + '</span>',
      '      <span>' + escapeHtml(movie.categoryName) + '</span>',
      '    </div>',
      '    <p class="movie-desc line-clamp-2">' + escapeHtml(movie.oneLine) + '</p>',
      '    <div class="tag-list" style="margin-top: 0.8rem;">' + tags + '</div>',
      '  </div>',
      '</a>'
    ].join('');
  }

  function populateSelect(select, values, label) {
    if (!select) {
      return;
    }
    select.innerHTML = '<option value="">' + label + '</option>' + values.map(function (value) {
      return '<option value="' + escapeHtml(value) + '">' + escapeHtml(value) + '</option>';
    }).join('');
  }

  function render() {
    var list = document.querySelector('[data-search-results]');
    var counter = document.querySelector('[data-search-counter]');
    var empty = document.querySelector('[data-search-empty]');
    if (!list) {
      return;
    }

    var query = normalize(state.query);
    var type = normalize(state.type);
    var year = normalize(state.year);
    var region = normalize(state.region);
    var results = state.movies.filter(function (movie) {
      var haystack = normalize(movie.title + ' ' + movie.region + ' ' + movie.type + ' ' + movie.year + ' ' + movie.genre + ' ' + movie.oneLine + ' ' + movie.tags.join(' '));
      if (query && haystack.indexOf(query) === -1) {
        return false;
      }
      if (type && normalize(movie.type) !== type) {
        return false;
      }
      if (year && normalize(movie.year) !== year) {
        return false;
      }
      if (region && normalize(movie.region) !== region) {
        return false;
      }
      return true;
    });

    var limited = results.slice(0, 240);
    list.innerHTML = limited.map(createCard).join('');

    if (counter) {
      counter.textContent = '匹配 ' + results.length + ' 部影片，当前显示前 ' + limited.length + ' 部';
    }
    if (empty) {
      empty.classList.toggle('is-visible', results.length === 0);
    }
  }

  function bindControls() {
    var input = document.querySelector('[data-search-input]');
    var typeSelect = document.querySelector('[data-search-type]');
    var yearSelect = document.querySelector('[data-search-year]');
    var regionSelect = document.querySelector('[data-search-region]');

    if (input) {
      input.addEventListener('input', function () {
        state.query = input.value;
        render();
      });
    }
    if (typeSelect) {
      typeSelect.addEventListener('change', function () {
        state.type = typeSelect.value;
        render();
      });
    }
    if (yearSelect) {
      yearSelect.addEventListener('change', function () {
        state.year = yearSelect.value;
        render();
      });
    }
    if (regionSelect) {
      regionSelect.addEventListener('change', function () {
        state.region = regionSelect.value;
        render();
      });
    }
  }

  function getInitialQuery() {
    try {
      return new URLSearchParams(window.location.search).get('q') || '';
    } catch (error) {
      return '';
    }
  }

  function boot(movies) {
    var input = document.querySelector('[data-search-input]');
    state.movies = movies;
    state.query = getInitialQuery();
    if (input && state.query) {
      input.value = state.query;
    }
    populateSelect(document.querySelector('[data-search-type]'), uniqueOptions(movies, 'type'), '全部类型');
    populateSelect(document.querySelector('[data-search-year]'), uniqueOptions(movies, 'year'), '全部年份');
    populateSelect(document.querySelector('[data-search-region]'), uniqueOptions(movies, 'region'), '全部地区');
    bindControls();
    render();
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (Array.isArray(window.MOVIE_DATA)) {
      boot(window.MOVIE_DATA);
      return;
    }

    fetch('assets/data/movies.json')
      .then(function (response) {
        return response.json();
      })
      .then(boot)
      .catch(function () {
        var empty = document.querySelector('[data-search-empty]');
        if (empty) {
          empty.textContent = '搜索数据加载失败，请检查文件路径。';
          empty.classList.add('is-visible');
        }
      });
  });
})();
