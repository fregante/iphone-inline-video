(function () {
	var video = document.querySelector('video');
	// debug events
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
		'playing', // fake events
		'waiting',
		'seeking', // triggered by player, never by the user
		'seeked', // triggered by player, never by the user
		'ended',
	// 'durationchange',
		'timeupdate',
		'play', // fake events
		'pause', // fake events
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
