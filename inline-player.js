'use strict';
Object.defineProperty(exports, '__esModule', {
	value: true
});
exports['default'] = makeVideoPlayableInline;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _getIntervalometer = require('./getIntervalometer');

var _getIntervalometer2 = _interopRequireDefault(_getIntervalometer);

var _preventEvent = require('./prevent-event');

var _preventEvent2 = _interopRequireDefault(_preventEvent);

var _proxyProperty = require('./proxy-property');

var _proxyProperty2 = _interopRequireDefault(_proxyProperty);

var isNeeded = /iPhone|iPod/i.test(navigator.userAgent);

/**
 * known issues:
 * it cannot go fullscreen before it's played inline first
 * changing the src won't update the audio
 * doesn't work without audio
 * no play and playing events
 */

/**
 * UTILS
 */

function getAudioFromVideo(video) {
	var audio = new Audio();
	audio.src = video.currentSrc || video.src;
	return audio;
}
function update() {
	var player = this;
	if (player.audio) {
		var audioTime = player.audio.currentTime;
		player.video.currentTime = audioTime;
		console.assert(player.video.currentTime === audioTime, 'Video not updating!');
	}
}
function startVideoBuffering(video) {
	// this needs to be inside an event handler
	video._play();
	setTimeout(function () {
		video._pause();
	}, 0);
}

/**
 * METHODS
 */

function play() {
	// console.log('play')
	var video = this;
	var player = video.__ivp;
	if (!video.buffered.length) {
		// console.log('Video not ready. Buffering')
		startVideoBuffering(video);
	}
	player.paused = false;
	player.updater.start();
	if (player.audio) {

		player.audio.play();
	}
}
function pause() {
	// console.log('pause')
	var player = this.__ivp;
	player.paused = true;
	player.updater.stop();
	if (player.audio) {
		player.audio.pause();
	}
}

/**
 * SETUP
 */

function addPlayer(video, hasAudio) {
	var player = video.__ivp = {};
	player.paused = true;
	player.loop = video.loop;
	player.muted = video.muted;
	player.video = video;
	if (hasAudio) {
		player.audio = getAudioFromVideo(video);
	}
	player.updater = (0, _getIntervalometer2['default'])(update.bind(player));

	video.addEventListener('ended', function () {
		player.paused = true;
	});

	// stop programmatic player when OS takes over
	video.addEventListener('webkitbeginfullscreen', function () {
		//@todo: should be on play?
		video.pause();
	});
	if (player.audio) {
		// sync audio to new video position
		video.addEventListener('webkitendfullscreen', function () {
			//@todo: should be on pause?
			player.audio.currentTime = player.video.currentTime;
			// console.assert(player.audio.currentTime === player.video.currentTime, 'Audio not synced');
		});
	}
}

function overloadAPI(video) {
	var player = video.__ivp;
	video._play = video.play;
	video._pause = video.pause;
	video.play = play;
	video.pause = pause;
	(0, _proxyProperty2['default'])(video, 'paused', player);
	(0, _proxyProperty2['default'])(video, 'loop', player);
	(0, _proxyProperty2['default'])(video, 'muted', player);
	(0, _preventEvent2['default'])(video, 'seeking');
	(0, _preventEvent2['default'])(video, 'seeked');
}

function makeVideoPlayableInline(video) {
	var hasAudio = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];
	var onlyWhenNeeded = arguments.length <= 2 || arguments[2] === undefined ? true : arguments[2];

	if (onlyWhenNeeded && isNeeded) {
		return;
	}
	addPlayer(video, hasAudio);
	overloadAPI(video);
	// console.log('Video will play inline');
}

module.exports = exports['default'];
