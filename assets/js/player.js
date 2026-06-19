import { H as Hls } from './hls.js';

export function initMoviePlayer(source, poster) {
  const video = document.getElementById('movieVideo');
  const button = document.getElementById('playButton');
  let hls = null;
  let ready = false;

  if (!video || !button || !source) {
    return;
  }

  video.poster = poster || video.poster;

  function setSource() {
    if (ready) {
      return Promise.resolve();
    }

    ready = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return Promise.resolve();
    }

    if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      return new Promise(function (resolve) {
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
          resolve();
        });
        hls.on(Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal && hls) {
            if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            } else {
              hls.destroy();
            }
          }
        });
      });
    }

    video.src = source;
    return Promise.resolve();
  }

  function playVideo() {
    button.classList.add('is-hidden');
    setSource().then(function () {
      const attempt = video.play();
      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(function () {
          button.classList.remove('is-hidden');
        });
      }
    });
  }

  button.addEventListener('click', playVideo);
  video.addEventListener('click', function () {
    if (video.paused) {
      playVideo();
    }
  });
  video.addEventListener('play', function () {
    button.classList.add('is-hidden');
  });
  window.addEventListener('pagehide', function () {
    if (hls) {
      hls.destroy();
    }
  });
}
