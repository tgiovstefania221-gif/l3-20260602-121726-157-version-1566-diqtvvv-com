(function() {
  function attachPlayer(box) {
    const video = box.querySelector("video");
    const cover = box.querySelector(".player-cover");
    const button = box.querySelector(".player-start");

    if (!video || !button) {
      return;
    }

    const url = video.getAttribute("data-url");
    let ready = false;

    function loadVideo() {
      if (ready || !url) {
        return;
      }

      ready = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        const hls = new window.Hls();
        hls.loadSource(url);
        hls.attachMedia(video);
      } else {
        video.src = url;
      }
    }

    function playVideo() {
      loadVideo();
      box.classList.add("playing");
      const playResult = video.play();

      if (playResult && typeof playResult.catch === "function") {
        playResult.catch(function() {
          box.classList.remove("playing");
        });
      }
    }

    button.addEventListener("click", playVideo);

    if (cover) {
      cover.addEventListener("click", playVideo);
    }

    video.addEventListener("play", function() {
      box.classList.add("playing");
    });

    video.addEventListener("pause", function() {
      if (!video.ended) {
        return;
      }
      box.classList.remove("playing");
    });
  }

  Array.from(document.querySelectorAll(".player-box")).forEach(attachPlayer);
})();
