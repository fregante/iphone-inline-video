# Changelog

* 2.0.0 
	* Automatically detect muted videos via attribute
	* Added native iPad detection via option
	* Changed global from `makeVideoPlayableInline` to `enableInlineVideo`
	* Included non-minified file
	* Renamed minified file to `iphone-inline-video.min.js`
	* If the video was natively playing, now it pauses automatically
* 1.9.0 Improved support for changing the `src` (via property or attribute)
* 1.8.0 Made muted playback more reliable on slower connections
* 1.7.0 Added support for `playbackRate`
* 1.6.0 Added support for changing the `src` (via property or attribute)
* 1.5.0 Added support for looping `<video loop>` or `video.loop = true`
* 1.4.0 Added support for seeking via `video.currentTime = 3.9 /* time in seconds */`
* 1.3.0 Added autoplay support for silent videos on on iPhone via `<video autoplay>`
* 1.2.0 Improved support for `ended` events
* 1.1.0 Cleanup, smaller build with rollup
