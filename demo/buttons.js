(function () {
	var video = document.querySelector('video');
	var playBtn = document.querySelector('.play');
	var fsBtn = document.querySelector('.fullscreen');

	if (playBtn) {
		playBtn.addEventListener('click', function () {
			if (video.paused) {
				video.play();
			} else {
				video.pause();
			}
		});
	}

	if (fsBtn) {
		fsBtn.addEventListener('click', function () {
			video.webkitEnterFullScreen();
		});
	}
}());
