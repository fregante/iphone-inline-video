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

/**
 * METHODS
 */

function play() {
	// console.log('play')
	var video = this;
	var player = video[ಠ];

	// if it's fullscreen, the developer the native player
	if (video.webkitDisplayingFullscreen) {
		video[ಠplay]();
		return;
	}

	if (!video.buffered.length) {
		video.load();
	}
	player.driver.play();
	player.updater.start();

	video.dispatchEvent(new Event('play'));

	// TODO: should be fired later
	video.dispatchEvent(new Event('playing'));
}
function pause() {
	// console.log('pause')
	var video = this;
	var player = video[ಠ];
	player.updater.stop();
	player.driver.pause();

	// TODO: should not fire again if the VIDEO was already paused/ended
	video.dispatchEvent(new Event('pause'));
	if (video.ended) {
		video[ಠevent] = true;
		video.dispatchEvent(new Event('ended'));
	}

	// if it's fullscreen, the developer the native player.pause()
	// This is at the end of pause() because it also
	// needs to make sure that the simulation is paused
	if (video.webkitDisplayingFullscreen) {
		video[ಠpause]();
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
	video.addEventListener('webkitbeginfullscreen', function () {
		if (!video.paused) {
			// make sure that the <audio> and the syncer/updater are stopped
			video.pause();

			// play video natively
			video[ಠplay]();
		} else if (hasAudio && !player.driver.buffered.length) {
			// if the first play is native,
			// the <audio> needs to be buffered manually
			// so when the fullscreen ends, it can be set to the same current time
			player.driver.load();
		}
	});
	if (hasAudio) {
		video.addEventListener('webkitendfullscreen', function () {
			// sync audio to new video position
			player.driver.currentTime = player.video.currentTime;
			// console.assert(player.driver.currentTime === player.video.currentTime, 'Audio not synced');
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
	if (!hasAudio && video.autoplay) {
		video.play();
	}
}

export default index;