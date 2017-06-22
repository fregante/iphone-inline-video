import {frameIntervalometer} from 'intervalometer';
import preventEvent from './lib/prevent-event';
import proxyProperty from './lib/proxy-property';
import proxyEvent from './lib/proxy-event';
import dispatchEventAsync from './lib/dispatch-event-async';

const iOS8or9 = typeof document === 'object' && 'object-fit' in document.head.style && !matchMedia('(-webkit-video-playable-inline)').matches;

const IIV = 'bfred-it:iphone-inline-video';
const IIVEvent = 'bfred-it:iphone-inline-video:event';
const IIVPlay = 'bfred-it:iphone-inline-video:nativeplay';
const IIVPause = 'bfred-it:iphone-inline-video:nativepause';

/**
 * UTILS
 */

function getAudioFromVideo(video) {
	const audio = new Audio();
	proxyEvent(video, 'play', audio);
	proxyEvent(video, 'playing', audio);
	proxyEvent(video, 'pause', audio);
	audio.crossOrigin = video.crossOrigin;

	// 'data:' causes audio.networkState > 0
	// which then allows to keep <audio> in a resumable playing state
	// i.e. once you set a real src it will keep playing if it was if .play() was called
	audio.src = video.src || video.currentSrc || 'data:';

	// // if (audio.src === 'data:') {
	//   TODO: wait for video to be selected
	// // }
	return audio;
}

const lastRequests = [];
let requestIndex = 0;
let lastTimeupdateEvent;

function setTime(video, time, rememberOnly) {
	// Allow one timeupdate event every 200+ ms
	if ((lastTimeupdateEvent || 0) + 200 < Date.now()) {
		video[IIVEvent] = true;
		lastTimeupdateEvent = Date.now();
	}
	if (!rememberOnly) {
		video.currentTime = time;
	}
	lastRequests[++requestIndex % 3] = time * 100 | 0 / 100;
}

function isPlayerEnded(player) {
	return player.driver.currentTime >= player.video.duration;
}

function update(timeDiff) {
	const player = this;
	// // console.log('update', player.video.readyState, player.video.networkState, player.driver.readyState, player.driver.networkState, player.driver.paused);
	if (player.video.readyState >= player.video.HAVE_FUTURE_DATA) {
		if (!player.hasAudio) {
			player.driver.currentTime = player.video.currentTime + ((timeDiff * player.video.playbackRate) / 1000);
			if (player.video.loop && isPlayerEnded(player)) {
				player.driver.currentTime = 0;
			}
		}
		setTime(player.video, player.driver.currentTime);
	} else if (player.video.networkState === player.video.NETWORK_IDLE && player.video.buffered.length === 0) {
		// This should happen when the source is available but:
		// - it's potentially playing (.paused === false)
		// - it's not ready to play
		// - it's not loading
		// If it hasAudio, that will be loaded in the 'emptied' handler below
		player.video.load();
		// // console.log('Will load');
	}

	// // console.assert(player.video.currentTime === player.driver.currentTime, 'Video not updating!');

	if (player.video.ended) {
		delete player.video[IIVEvent]; // Allow timeupdate event
		player.video.pause(true);
	}
}

/**
 * METHODS
 */

function play() {
	// // console.log('play');
	const video = this;
	const player = video[IIV];

	// If it's fullscreen, use the native player
	if (video.webkitDisplayingFullscreen) {
		video[IIVPlay]();
		return;
	}

	if (player.driver.src !== 'data:' && player.driver.src !== video.src) {
		// // console.log('src changed on play', video.src);
		setTime(video, 0, true);
		player.driver.src = video.src;
	}

	if (!video.paused) {
		return;
	}
	player.paused = false;

	if (video.buffered.length === 0) {
		// .load() causes the emptied event
		// the alternative is .play()+.pause() but that triggers play/pause events, even worse
		// possibly the alternative is preventing this event only once
		video.load();
	}

	player.driver.play();
	player.updater.start();

	if (!player.hasAudio) {
		dispatchEventAsync(video, 'play');
		if (player.video.readyState >= player.video.HAVE_ENOUGH_DATA) {
			// // console.log('onplay');
			dispatchEventAsync(video, 'playing');
		}
	}
}
function pause(forceEvents) {
	// // console.log('pause');
	const video = this;
	const player = video[IIV];

	player.driver.pause();
	player.updater.stop();

	// If it's fullscreen, the developer the native player.pause()
	// This is at the end of pause() because it also
	// needs to make sure that the simulation is paused
	if (video.webkitDisplayingFullscreen) {
		video[IIVPause]();
	}

	if (player.paused && !forceEvents) {
		return;
	}

	player.paused = true;
	if (!player.hasAudio) {
		dispatchEventAsync(video, 'pause');
	}

	// Handle the 'ended' event only if it's not fullscreen
	if (video.ended && !video.webkitDisplayingFullscreen) {
		video[IIVEvent] = true;
		dispatchEventAsync(video, 'ended');
	}
}

/**
 * SETUP
 */

function addPlayer(video, hasAudio) {
	const player = {};
	video[IIV] = player;
	player.paused = true; // Track whether 'pause' events have been fired
	player.hasAudio = hasAudio;
	player.video = video;
	player.updater = frameIntervalometer(update.bind(player));

	if (hasAudio) {
		player.driver = getAudioFromVideo(video);
	} else {
		video.addEventListener('canplay', () => {
			if (!video.paused) {
				// // console.log('oncanplay');
				dispatchEventAsync(video, 'playing');
			}
		});
		player.driver = {
			src: video.src || video.currentSrc || 'data:',
			muted: true,
			paused: true,
			pause: () => {
				player.driver.paused = true;
			},
			play: () => {
				player.driver.paused = false;
				// Media automatically goes to 0 if .play() is called when it's done
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
	video.addEventListener('emptied', () => {
		// // console.log('driver src is', player.driver.src);
		const wasEmpty = !player.driver.src || player.driver.src === 'data:';
		if (player.driver.src && player.driver.src !== video.src) {
			// // console.log('src changed to', video.src);
			setTime(video, 0, true);
			player.driver.src = video.src;
			// Playing videos will only keep playing if no src was present when .play()’ed
			if (wasEmpty || (!hasAudio && video.autoplay)) {
				player.driver.play();
			} else {
				player.updater.stop();
			}
		}
	}, false);

	// Stop programmatic player when OS takes over
	video.addEventListener('webkitbeginfullscreen', () => {
		if (!video.paused) {
			// Make sure that the <audio> and the syncer/updater are stopped
			video.pause();

			// Play video natively
			video[IIVPlay]();
		} else if (hasAudio && player.driver.buffered.length === 0) {
			// If the first play is native,
			// the <audio> needs to be buffered manually
			// so when the fullscreen ends, it can be set to the same current time
			player.driver.load();
		}
	});
	if (hasAudio) {
		video.addEventListener('webkitendfullscreen', () => {
			// Sync audio to new video position
			player.driver.currentTime = video.currentTime;
			// // console.assert(player.driver.currentTime === video.currentTime, 'Audio not synced');
		});

		// Allow seeking
		video.addEventListener('seeking', () => {
			if (lastRequests.indexOf(video.currentTime * 100 | 0 / 100) < 0) {
				// // console.log('User-requested seeking');
				player.driver.currentTime = video.currentTime;
			}
		});
	}
}

function preventWithPropOrFullscreen(el) {
	const isAllowed = el[IIVEvent];
	delete el[IIVEvent];
	return !el.webkitDisplayingFullscreen && !isAllowed;
}

function overloadAPI(video) {
	const player = video[IIV];
	video[IIVPlay] = video.play;
	video[IIVPause] = video.pause;
	video.play = play;
	video.pause = pause;
	proxyProperty(video, 'paused', player.driver);
	proxyProperty(video, 'muted', player.driver, true);
	proxyProperty(video, 'playbackRate', player.driver, true);
	proxyProperty(video, 'ended', player.driver);
	proxyProperty(video, 'loop', player.driver, true);

	// IIV works by seeking 60 times per second.
	// These events are now useless.
	preventEvent(video, 'seeking', el => !el.webkitDisplayingFullscreen);
	preventEvent(video, 'seeked', el => !el.webkitDisplayingFullscreen);

	// Limit timeupdate events
	preventEvent(video, 'timeupdate', preventWithPropOrFullscreen);

	// Prevent occasional native ended events
	preventEvent(video, 'ended', preventWithPropOrFullscreen);
}

export default function enableInlineVideo(video, opts = {}) {
	// Stop if already enabled
	if (video[IIV]) {
		return;
	}

	// Allow the user to skip detection
	if (!opts.everywhere) {
		// Only iOS8 and 9 are supported
		if (!iOS8or9) {
			return;
		}

		// Stop if it's not an allowed device
		if (!(opts.iPad || opts.ipad ? /iPhone|iPod|iPad/ : /iPhone|iPod/).test(navigator.userAgent)) {
			return;
		}
	}

	// Try to pause
	video.pause();

	// Prevent autoplay.
	// An non-started autoplaying video can't be .pause()'d
	const willAutoplay = video.autoplay;
	video.autoplay = false;

	addPlayer(video, !video.muted);
	overloadAPI(video);
	video.classList.add('IIV');

	// Autoplay
	if (video.muted && willAutoplay) {
		video.play();
		video.addEventListener('playing', function restoreAutoplay() {
			video.autoplay = true;
			video.removeEventListener('playing', restoreAutoplay);
		});
	}

	if (!/iPhone|iPod|iPad/.test(navigator.platform)) {
		console.warn('iphone-inline-video is not guaranteed to work in emulated environments');
	}
}
