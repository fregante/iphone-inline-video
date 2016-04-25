'use strict';
import Intervalometer from './lib/intervalometer';
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

const lastRequests = Array(3);
lastRequests.i = 0;

function setTime(video, time) {
	video.currentTime = time;
	lastRequests[++lastRequests.i % 3] = time * 100 | 0 / 100;
}

function isPlayerEnded(player) {
	return player.driver.currentTime >= player.video.duration;
}

function update(timeDiff) {
	// console.log('update')
	const player = this;
	if (!player.hasAudio) {
		player.driver.currentTime = player.video.currentTime + timeDiff / 1000;
		if (player.video.loop && isPlayerEnded(player)) {
			player.driver.currentTime = 0;
		}
	}
	setTime(player.video, player.driver.currentTime);

	// console.assert(player.video.currentTime === player.driver.currentTime, 'Video not updating!');

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

	if (!video.paused) {
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

	player.driver.pause();
	player.updater.stop();

	if (video.paused) {
		return;
	}

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
	player.updater = new Intervalometer(update.bind(player));

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
				if (isPlayerEnded(player)) {
					setTime(video, 0);
				}
			},
			get ended() {
				return isPlayerEnded(player);
			}
		};
	}

	// .load() causes the emptied event
	// the alternative is .play()+.pause() but that triggers play/pause events, even worse
	// possibly the alternative is preventing this event only once
	video.addEventListener('emptied', () => {
		if (player.driver.src && player.driver.src !== video.src) {
			// console.log('src changed', video.src);
			setTime(video, 0);
			video.pause();
			player.driver.src = video.src;
		}
	}, false);

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

		// allow seeking
		video.addEventListener('seeking', () => {
			if (lastRequests.indexOf(player.video.currentTime * 100 | 0 / 100) < 0) {
				// console.log('User-requested seeking');
				player.driver.currentTime = player.video.currentTime;
			}
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
	proxyProperty(video, 'muted', player.driver, true);
	proxyProperty(video, 'ended', player.driver); // TODO: read only (it fails automatically only when it has audio)
	proxyProperty(video, 'loop', player.driver, true);
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
