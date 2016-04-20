// buttons
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


// debug events
(function () {
	var video = document.querySelector('video');
	[
		'loadstart',
		'progress',
		'suspend',
		'abort',
		'error',
		'emptied',
		'stalled',
		'loadedmetadata',
		'loadeddata',
		'canplay',
		'canplaythrough',
		'playing', // fake event
		'waiting',
		'seeking',
		'seeked',
		'ended',
	// 'durationchange',
		'timeupdate',
		'play', // fake event
		'pause', // fake event
	// 'ratechange',
	// 'resize',
	// 'volumechange',
		'webkitbeginfullscreen',
		'webkitendfullscreen',
	].forEach(function (event) {
		video.addEventListener(event, function () {
			console.info('@', event);
		});
	});
} ());
