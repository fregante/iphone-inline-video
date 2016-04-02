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

/**
 * METHODS
 */

function play() {
	// console.log('play')
	const video = this;
	const player = video[ಠ];

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
	const video = this;
	const player = video[ಠ];
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
	video.addEventListener('webkitbeginfullscreen', () => {
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
		video.addEventListener('webkitendfullscreen', () => {
			// sync audio to new video position
			player.driver.currentTime = player.video.currentTime;
			// console.assert(player.driver.currentTime === player.video.currentTime, 'Audio not synced');
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
	preventEvent(video, 'ended', ಠevent, false); // prevent occasional native ended events
}

/* makeVideoPlayableInline() */
export default function (video, hasAudio = true, onlyWhenNeeded = true) {
	if (onlyWhenNeeded && !isNeeded) {
		return;
	}
	addPlayer(video, hasAudio);
	overloadAPI(video);
	if (!hasAudio && video.autoplay) {
		video.play();
	}
}
