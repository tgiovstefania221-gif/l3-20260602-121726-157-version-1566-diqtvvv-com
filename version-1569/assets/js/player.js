import { H as Hls } from './hls-dru42stk.js';

function showMessage(shell, text) {
  var message = shell.querySelector('[data-player-message]');
  if (!message) {
    return;
  }
  message.textContent = text;
  message.classList.add('is-visible');
}

function hideMessage(shell) {
  var message = shell.querySelector('[data-player-message]');
  if (message) {
    message.textContent = '';
    message.classList.remove('is-visible');
  }
}

function setupHlsPlayer(shell) {
  var video = shell.querySelector('video[data-src]');
  var overlay = shell.querySelector('[data-player-overlay]');
  if (!video) {
    return;
  }

  var source = video.getAttribute('data-src');
  var initialized = false;
  var hls = null;

  function attachSource() {
    if (initialized) {
      return Promise.resolve();
    }

    initialized = true;
    hideMessage(shell);

    if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, function (event, data) {
        if (!data || !data.fatal) {
          return;
        }

        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          showMessage(shell, '网络错误：正在尝试重新加载视频流。');
          hls.startLoad();
        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          showMessage(shell, '媒体错误：正在尝试恢复播放。');
          hls.recoverMediaError();
        } else {
          showMessage(shell, '当前浏览器无法继续播放该视频流。');
          hls.destroy();
        }
      });
      return Promise.resolve();
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return Promise.resolve();
    }

    showMessage(shell, '您的浏览器不支持 HLS 视频播放，请更换现代浏览器访问。');
    return Promise.reject(new Error('HLS is not supported'));
  }

  function play() {
    attachSource().then(function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          if (overlay) {
            overlay.classList.remove('is-hidden');
          }
          showMessage(shell, '浏览器阻止了自动播放，请再次点击播放按钮。');
        });
      }
    }).catch(function () {});
  }

  if (overlay) {
    overlay.addEventListener('click', play);
  }

  video.addEventListener('play', function () {
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
  });

  video.addEventListener('pause', function () {
    if (video.currentTime === 0 && overlay) {
      overlay.classList.remove('is-hidden');
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
}

document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('[data-player-shell]').forEach(setupHlsPlayer);
});
