'use strict';
import getIntervalometer from './intervalometer';
import preventEvent from './prevent-event';
import proxyProperty from './proxy-property';


/**
 * known issues:
 * it cannot go fullscreen before it's played inline first
 * changing the src won't update the audio
 * no play and playing events
 * unknown behavior when no audio + slow connection
 */

const isNeeded = /iPhone|iPod/i.test(navigator.userAgent);

/**
 * UTILS
 */

function getAudioFromVideo (video) {
	const audio = new Audio();
	audio.src = video.currentSrc || video.src;
	return audio;
}
function update (timeDiff) {
	const player = this;
	if (player.audio) {
		const audioTime = player.audio.currentTime;
		player.video.currentTime = audioTime;
		// console.assert(player.video.currentTime === audioTime, 'Video not updating!')
	} else {
		if (player.video.currentTime === player.video.duration) {
			player.video.currentTime = 0;
			return;
		}
		let nextTime = player.video.currentTime + timeDiff/1000;
		player.video.currentTime = Math.min(player.video.duration, nextTime);
	}
}
function startVideoBuffering (video) {
	// this needs to be inside an event handler
	video._play();
	setTimeout(function () {
		video._pause();
	}, 0);
}

/**
 * METHODS
 */

function play () {
	// console.log('play')
	const video = this;
	const player = video.__ivp;
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
function pause () {
	// console.log('pause')
	const player = this.__ivp;
	player.paused = true;
	player.updater.stop();
	if (player.audio) {
		player.audio.pause();
	}
}

/**
 * SETUP
 */

function addPlayer (video, hasAudio) {
	const player = video.__ivp = {};
	player.paused = true;
	player.loop = video.loop;
	player.muted = video.muted;
	player.video = video;
	if (hasAudio) {
		player.audio = getAudioFromVideo(video);
	}
	player.updater = getIntervalometer(update.bind(player));

	video.addEventListener('ended', function () {
		// console.log('ended')
		player.paused = true;
		player.updater.stop();
	});

	// stop programmatic player when OS takes over
	video.addEventListener('webkitbeginfullscreen', function () {//@todo: should be on play?
		video.pause();
	});
	if (player.audio) {
		// sync audio to new video position
		video.addEventListener('webkitendfullscreen', function () {//@todo: should be on pause?
			player.audio.currentTime = player.video.currentTime;
			// console.assert(player.audio.currentTime === player.video.currentTime, 'Audio not synced');
		});
	}
}

function overloadAPI (video) {
	const player = video.__ivp;
	video._play = video.play;
	video._pause = video.pause;
	video.play = play;
	video.pause = pause;
	proxyProperty(video, 'paused', player);
	proxyProperty(video, 'loop', player);
	proxyProperty(video, 'muted', player);
	preventEvent(video, 'seeking');
	preventEvent(video, 'seeked');
}

export default function makeVideoPlayableInline (video, hasAudio = true, onlyWhenNeeded = true) {
	if (onlyWhenNeeded && !isNeeded) {
		return;
	}
	addPlayer(video, hasAudio);
	overloadAPI(video);
	// console.log('Video will play inline');
}
