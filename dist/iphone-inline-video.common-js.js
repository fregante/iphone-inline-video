'use strict';

function getIntervalometer(cb) {
	var raf = {
		start: function start() {
			if (!raf.lastCall) {
				raf.lastCall = Date.now();
			}
			var timeDiffSinceLastCycle = Date.now() - raf.lastCall;
			raf.id = requestAnimationFrame(raf.start);
			raf.lastCall = Date.now();

			// must be after raf() because it might call .stop()
			cb(timeDiffSinceLastCycle);
		},
		stop: function stop() {
			cancelAnimationFrame(raf.id);
			delete raf.id;
			delete raf.lastCall;
		}
	};
	return raf;
}

function preventEvent(element, eventName, toggleProperty, preventWithProperty) {
	var handler = function handler(e) {
		var hasProperty = toggleProperty && element[toggleProperty];
		delete element[toggleProperty];
		if (Boolean(hasProperty) === Boolean(preventWithProperty)) {
			e.stopImmediatePropagation();
			// console.log(eventName, 'prevented on', element);
		}
	};
	element.addEventListener(eventName, handler, false);
	return {
		forget: function forget() {
			return element.removeEventListener(eventName, handler, false);
		}
	};
}

function proxyProperty(object, propertyName, sourceObject) {
	Object.defineProperty(object, propertyName, {
		get: function get() {
			return sourceObject[propertyName];
		},
		set: function set(va) {
			sourceObject[propertyName] = va;
		}
	});
}

/*
Poor man's Symbol implementation, not compliant
Defaults to the browser's Symbol if available

http://www.2ality.com/2014/12/es6-symbols.html#symbols_as_property_keys

Ideal to be used instead of: obj.___hiddenProp
as: obj[Symbol('hidden-prop')]

Usage example:

import Symbol from './poor-mans-symbol';
const ಠ = Symbol('my-nice-module');
el[ಠ] = 'Some private stuff';

*/

var _Symbol = window.Symbol || function (description) {
	return '@' + (description ? description : '@') + Math.random().toString(26);
};

var isNeeded = /iPhone|iPod/i.test(navigator.userAgent);

var ಠ = _Symbol('iiv');
var ಠevent = _Symbol('iive');
var ಠplay = _Symbol('native-play');
var ಠpause = _Symbol('native-pause');

/**
 * UTILS
 */

function getAudioFromVideo(video) {
	var audio = new Audio();
	audio.src = video.currentSrc || video.src;
	return audio;
}

function update(timeDiff) {
	// console.log('update')
	var player = this;
	var nextTime = void 0;
	if (player.hasAudio) {
		nextTime = player.driver.currentTime;
	} else {
		nextTime = player.video.currentTime + timeDiff / 1000;
	}
	player.video.currentTime = Math.min(player.video.duration, nextTime);
	// console.assert(player.video.currentTime === nextTime, 'Video not updating!');

	if (player.video.ended) {
		player.video.pause();
		return false;
	}
}

function startVideoBuffering(video) {
	// this needs to be inside an event handler
	video[ಠevent] = true;
	video[ಠplay]();
	setTimeout(function () {
		video[ಠevent] = true;
		video[ಠpause]();
	}, 0);
}

/**
 * METHODS
 */

function play() {
	// console.log('play')
	var video = this;
	var player = video[ಠ];
	if (!video.buffered.length) {
		// console.log('Video not ready. Buffering')
		// TODO: maybe replace with .load()
		// TODO: maybe .load() needs to be polyfilled to this
		startVideoBuffering(video);
	}
	player.driver.play();
	player.updater.start();

	video.dispatchEvent(new Event('play'));
	video.dispatchEvent(new Event('playing'));
}
function pause() {
	// console.log('pause')
	var video = this;
	var player = video[ಠ];
	player.updater.stop();
	player.driver.pause();

	video.dispatchEvent(new Event('pause'));
	if (video.ended) {
		video[ಠevent] = true;
		video.dispatchEvent(new Event('ended'));
	}
}

/**
 * SETUP
 */

function addPlayer(video, hasAudio) {
	var player = video[ಠ] = {};
	player.hasAudio = hasAudio;
	player.video = video;
	player.updater = getIntervalometer(update.bind(player));

	if (hasAudio) {
		player.driver = getAudioFromVideo(video);
	} else {
		player.driver = {
			muted: true,
			paused: true,
			pause: function pause() {
				player.driver.paused = true;
			},
			play: function play() {
				player.driver.paused = false;
				// media automatically goes to 0 if .play() is called when it's done
				if (video.currentTime === video.duration) {
					video.currentTime = 0;
				}
			}
		};
	}

	// stop programmatic player when OS takes over
	// TODO: should be on play?
	video.addEventListener('webkitbeginfullscreen', function () {
		video.pause();
	});
	if (hasAudio) {
		// sync audio to new video position
		// TODO: should be on pause?
		video.addEventListener('webkitendfullscreen', function () {
			player.audio.currentTime = player.video.currentTime;
			// console.assert(player.audio.currentTime === player.video.currentTime, 'Audio not synced');
		});
	}
}

function overloadAPI(video) {
	var player = video[ಠ];
	video[ಠplay] = video.play;
	video[ಠpause] = video.pause;
	video.play = play;
	video.pause = pause;
	proxyProperty(video, 'paused', player.driver);
	proxyProperty(video, 'muted', player.driver);
	preventEvent(video, 'seeking');
	preventEvent(video, 'seeked');
	preventEvent(video, 'play', ಠevent, true);
	preventEvent(video, 'playing', ಠevent, true);
	preventEvent(video, 'pause', ಠevent, true);
	preventEvent(video, 'ended', ಠevent, false); // prevent occasional native ended events
}

/* makeVideoPlayableInline() */
function index (video) {
	var hasAudio = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];
	var onlyWhenNeeded = arguments.length <= 2 || arguments[2] === undefined ? true : arguments[2];

	if (onlyWhenNeeded && !isNeeded) {
		return;
	}
	addPlayer(video, hasAudio);
	overloadAPI(video);
}

module.exports = index;