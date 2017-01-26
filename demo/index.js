var videos = document.querySelectorAll('video');
var behavior = document.querySelector('#behavior');

if (location.search === '?enabled=false') {
	behavior.innerHTML = '(module disabled everywhere via <code>?enabled=false</code>';
} else if (location.search === '?enabled=true') {
	enableVideos(true);
	behavior.innerHTML = '(module enabled everywhere (whether it’s necessary or not) via <code>?enabled=true</code>)';
} else {
	enableVideos();
}

function enableButtons(video) {
	var playBtn = video.parentNode.querySelector('.play');
	var fullscreenButton = video.parentNode.querySelector('.fullscreen');

	if (playBtn) {
		playBtn.addEventListener('click', function () {
			if (video.paused) {
				video.play();
			} else {
				video.pause();
			}
		});
	}

	if (fullscreenButton) {
		fullscreenButton.addEventListener('click', function () {
			video.webkitEnterFullScreen();
		});
	}
}

// debug events
function debugEvents(video) {
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
}

function enableVideos(everywhere) {
	for (var i = 0; i < videos.length; i++) {
		window.enableInlineVideo(videos[i], {everywhere: everywhere});
		enableButtons(videos[i]);
		debugEvents(videos[i]);
	}
}
