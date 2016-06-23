# iphone-inline-video

> Make videos playable inline on Safari on iPhone (prevents automatic fullscreen)

[![gzipped size](https://badges.herokuapp.com/size/github/bfred-it/iphone-inline-video/gh-pages/dist/iphone-inline-video.browser.js?gzip=true&label=gzipped%20size)](#readme) [![iOS 8 and 9.3 supported](https://img.shields.io/badge/iOS%20Safari-8%20%E2%80%93%209.3-brightgreen.svg)](#no-link) [![Travis build status](https://api.travis-ci.org/bfred-it/iphone-inline-video.svg?branch=gh-pages)](https://travis-ci.org/bfred-it/iphone-inline-video)  [![npm version](https://img.shields.io/npm/v/iphone-inline-video.svg)](https://www.npmjs.com/package/iphone-inline-video) 

This lets you:

- Play videos without forcing the fullscreen on the iPhone ([demo](http://bfred-it.github.io/iphone-inline-video/demo/))
- Play silent videos without user interaction
- Autoplay silent videos with the `autoplay` attribute ([demo](http://bfred-it.github.io/iphone-inline-video/demo/autoplay.html))
- Play multiple silent videos at the same time

This is essentially a polyfill for the upcoming [iOS 10's `webkit-playsinline`](#notes-about-ios-10)

[![Demo](http://bfred-it.github.io/iphone-inline-video/demo/demo-preview.gif)](http://bfred-it.github.io/iphone-inline-video/demo/)

## Main features

- <2KB, standalone (no frameworks required)
- No setup: include it, call `makeVideoPlayableInline(video)`, [done](#usage)
- No custom API for playback, you can just call `video.play()` on `click`
- Supports **audio**
- Supports [autoplay](#usage-with-autoplaying-videos) on silent videos
- Doesn't need canvas
- Doesn't create new elements/wrappers
- It works with existing players like jPlayer
- [Disabled automatically on iOS 10](#notes-about-ios-10)

Limitations:

- Needs user interaction to play videos with sound (standard iOS limitation)
- Currently limited to iPhone, [unneeded on iPad](https://github.com/bfred-it/iphone-inline-video/issues/48), disabled on Android
- The video framerate depends on `requestAnimationFrame`, so avoid expensive animations and similar while the video is playing. Try [stats.js](https://github.com/mrdoob/stats.js/) to visualize your page's framerate
- [Known issues](https://github.com/bfred-it/iphone-inline-video/labels/known%20issue)

## Install

```sh
npm install --save iphone-inline-video
```
```js
const makeVideoPlayableInline = require('iphone-inline-video');
```

If you don't use node, include the file `dist/iphone-inline-video.browser.js`

## Usage

You will need:

- a `<video>` element with the attribute `webkit-playsinline` (this is needed on iOS 10)

	```html
	<video src="file.mp4" webkit-playsinline></video>
	```
	
- the native play buttons will still trigger the fullscreen, so it's best to hide them (without breaking the video `controls`)

	```css
	.IIV::-webkit-media-controls-play-button,
	.IIV::-webkit-media-controls-start-playback-button {
	    opacity: 0;
	    pointer-events: none;
	    width: 5px;
	}
	```
	
- the activation call  

	```js
	// one video
	var video = document.querySelector('video');
	makeVideoPlayableInline(video);
	```
	
	```js
	// or if you're already using jQuery:
	var video = $('video').get(0);
	makeVideoPlayableInline(video);
	```
	
	```js
	// or if you have multiple videos:
	$('video').get().forEach(makeVideoPlayableInline)
	```

Done! It will only be enabled on iPhones and iPod Touch devices.

Now you can keep using it just like you would on a desktop. Run `video.play()`, `video.pause()`, listen to events with `video.addEventListener()` or `$(video).on()`, etc...

**BUT** you still need user interaction to play the audio, so do something like this:

```js
makeVideoPlayableInline(video);
video.addEventListener('touchstart', function () {
	video.play();
});
```

If at some point you want to open the video in fullscreen, use the standard (but still prefixed) `webkitEnterFullScreen()` API, but it has some [caveats.](https://github.com/bfred-it/iphone-inline-video/issues/33)

## Usage with audio-less videos

If your video file doesn't have an audio track, then you need this:

```js
makeVideoPlayableInline(video, /* hasAudio */ false);
```

And the `muted` attribute

```html
<video muted webkit-playsinline src="video.mp4"></video>
```

Muted videos can also be played without user interaction (`video.play()` doesn't need to be called inside an event listener).

## Usage with autoplaying videos

Thanks to the above behavior, muted videos can also autoplay:

```js
makeVideoPlayableInline(video, /* hasAudio */ false);
```

And the `autoplay` and `muted` attributes:

```html
<video autoplay muted webkit-playsinline src="video.mp4"></video>
```

## Notes about iOS 10

New features in iOS 10:

* videos play inline:  

    ```html
    <video webkit-playsinline src="video.mp4"></video>
    ```

* muted videos play inline without user interaction:  

    ```html
    <video muted webkit-playsinline src="video.mp4"></video>
    ```
    ```js
    setTimeout(function () { video.play(); }, 1000); // example
    ```

* muted videos autoplay inline:  

    ```html
    <video autoplay muted webkit-playsinline src="video.mp4"></video>
    ```

Essentially everything that this module does, so `iphone-inline-video` will be automatically disabled there. Make sure you have all the above attributes.

## License

MIT © [Federico Brigante](http://twitter.com/bfred_it)
