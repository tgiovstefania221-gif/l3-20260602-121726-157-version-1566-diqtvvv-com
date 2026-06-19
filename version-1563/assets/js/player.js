function initPlayer(videoSource) {
    const video = document.getElementById('moviePlayer');
    const button = document.querySelector('.play-overlay');

    if (!video || !videoSource) {
        return;
    }

    const attach = function () {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = videoSource;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            const hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(videoSource);
            hls.attachMedia(video);
            return;
        }

        video.src = videoSource;
    };

    const start = function () {
        attach();
        if (button) {
            button.classList.add('is-hidden');
        }
        const playRequest = video.play();
        if (playRequest && typeof playRequest.catch === 'function') {
            playRequest.catch(function () {});
        }
    };

    if (button) {
        button.addEventListener('click', start);
    }

    video.addEventListener('click', function () {
        if (video.paused) {
            start();
        }
    });

    video.addEventListener('play', function () {
        if (button) {
            button.classList.add('is-hidden');
        }
    });
}
