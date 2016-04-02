'use strict';
import getIntervalometer from './lib/intervalometer';
import preventEvent from './lib/prevent-event';
import proxyProperty from './lib/proxy-property';

const isNeeded = /iPhone|iPod/i.test(navigator.userAgent);

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
	if (player.audio) {
		const audioTime = player.audio.currentTime;
		player.video.currentTime = audioTime;
		// console.assert(player.video.currentTime === audioTime, 'Video not updating!')
	} else {
		const nextTime = player.video.currentTime + timeDiff / 1000;
		player.video.currentTime = Math.min(player.video.duration, nextTime);
	}
	if (player.video.ended) {
		player.video.pause();
		return false;
	}
}

function startVideoBuffering(video) {
	// this needs to be inside an event handler
	video.iaAutomatedEvent = true;
	video._play();
	setTimeout(() => {
		video.iaAutomatedEvent = true;
		video._pause();
	}, 0);
}

/**
 * METHODS
 */

function play() {
	// console.log('play')
	const video = this;
	const player = video.__ivp;
	if (!video.buffered.length) {
		// console.log('Video not ready. Buffering')
		startVideoBuffering(video);
	}
	player.paused = false;
	if (player.audio) {
		player.audio.play();
	} else if (video.currentTime === video.duration) {
		video.currentTime = 0;
	}
	player.updater.start();

	video.dispatchEvent(new Event('play'));
	video.dispatchEvent(new Event('playing'));
}
function pause() {
	// console.log('pause')
	const video = this;
	const player = video.__ivp;
	player.paused = true;
	player.updater.stop();
	if (player.audio) {
		player.audio.pause();
	}
	video.dispatchEvent(new Event('pause'));
	if (video.ended) {
		video.iaAutomatedEvent = true;
		video.dispatchEvent(new Event('ended'));
	}
}

/**
 * SETUP
 */

function addPlayer(video, hasAudio) {
	const player = video.__ivp = {};
	player.paused = true;
	player.loop = video.loop;
	player.muted = video.muted;
	player.video = video;
	if (hasAudio) {
		player.audio = getAudioFromVideo(video);
	}
	player.updater = getIntervalometer(update.bind(player));

	// stop programmatic player when OS takes over
	video.addEventListener('webkitbeginfullscreen', () => {// @todo: should be on play?
		video.pause();
	});
	if (player.audio) {
		// sync audio to new video position
		video.addEventListener('webkitendfullscreen', () => {// @todo: should be on pause?
			player.audio.currentTime = player.video.currentTime;
			// console.assert(player.audio.currentTime === player.video.currentTime, 'Audio not synced');
		});
	}
}

function overloadAPI(video) {
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
	preventEvent(video, 'play', 'iaAutomatedEvent', true);
	preventEvent(video, 'playing', 'iaAutomatedEvent', true);
	preventEvent(video, 'pause', 'iaAutomatedEvent', true);
	preventEvent(video, 'ended', 'iaAutomatedEvent', false); // prevent occasional native ended events
}

export default function /* makeVideoPlayableInline*/ (video, hasAudio = true, onlyWhenNeeded = true) {
	if (onlyWhenNeeded && !isNeeded) {
		return;
	}
	addPlayer(video, hasAudio);
	overloadAPI(video);
	// console.log('Video will play inline');
}
