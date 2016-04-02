'use strict';
import getIntervalometer from './lib/intervalometer';
import preventEvent from './lib/prevent-event';
import proxyProperty from './lib/proxy-property';
import Symbol from './lib/poor-mans-symbol';

const isNeeded = /iPhone|iPod/i.test(navigator.userAgent);

const ಠ = Symbol('iiv');
const ಠevent = Symbol('iive');
const ಠplay = Symbol('native-play');
const ಠpause = Symbol('native-pause');

/**
 * UTILS
 */

function getAudioFromVideo(video) {
	const audio = new Audio();
	audio.src = video.currentSrc || video.src;
	return audio;
}

function update(timeDiff) {
	// console.log('update')
	const player = this;
	let nextTime;
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
	setTimeout(() => {
		video[ಠevent] = true;
		video[ಠpause]();
	}, 0);
}

/**
 * METHODS
 */

function play() {
	// console.log('play')
	const video = this;
	const player = video[ಠ];
	if (!video.buffered.length) {
		// console.log('Video not ready. Buffering')
		startVideoBuffering(video);
	}
	player.driver.play();
	player.updater.start();

	video.dispatchEvent(new Event('play'));
	video.dispatchEvent(new Event('playing'));
}
function pause() {
	// console.log('pause')
	const video = this;
	const player = video[ಠ];
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
	const player = video[ಠ] = {};
	player.hasAudio = hasAudio;
	player.video = video;
	player.updater = getIntervalometer(update.bind(player));

	if (hasAudio) {
		player.driver = getAudioFromVideo(video);
	} else {
		player.driver = {
			muted: true,
			paused: true,
			pause: () => {
				player.driver.paused = true;
			},
			play: () => {
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
	video.addEventListener('webkitbeginfullscreen', () => {
		video.pause();
	});
	if (hasAudio) {
		// sync audio to new video position
		// TODO: should be on pause?
		video.addEventListener('webkitendfullscreen', () => {
			player.audio.currentTime = player.video.currentTime;
			// console.assert(player.audio.currentTime === player.video.currentTime, 'Audio not synced');
		});
	}
}

function overloadAPI(video) {
	const player = video[ಠ];
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
export default function (video, hasAudio = true, onlyWhenNeeded = true) {
	if (onlyWhenNeeded && !isNeeded) {
		return;
	}
	addPlayer(video, hasAudio);
	overloadAPI(video);
}
