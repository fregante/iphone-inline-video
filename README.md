# iphone-inline-video

> Make videos playable inline on Safari on iPhone (prevents automatic fullscreen)

[![gzipped size][badge-gzip]](#no-link)
[![Travis build status][badge-travis]][link-travis]
[![npm version][badge-version]][link-npm]

  [badge-gzip]: https://badges.herokuapp.com/size/github/bfred-it/iphone-inline-video/master/dist/iphone-inline-video.min.js?gzip=true&label=gzipped%20size
  [badge-travis]: https://api.travis-ci.org/bfred-it/iphone-inline-video.svg
  [badge-version]: https://img.shields.io/npm/v/iphone-inline-video.svg
  [link-travis]: https://travis-ci.org/bfred-it/iphone-inline-video
  [link-npm]: https://www.npmjs.com/package/iphone-inline-video

This enables [iOS 10's `playsinline` attribute](#notes-about-ios-10) on iOS 8 and iOS 9 (almost a polyfill). It lets you:

- Play videos without forcing the fullscreen on the iPhone ([demo](http://bfred-it.github.io/iphone-inline-video/demo/))
- Play silent videos without user interaction
- Autoplay silent videos with the `autoplay` attribute ([demo](http://bfred-it.github.io/iphone-inline-video/demo/autoplay.html))
- Use videos as WebGL/ThreeJS textures ([demo](http://bfred-it.github.io/iphone-inline-video/demo/threejs.html))

[![Demo](http://bfred-it.github.io/iphone-inline-video/demo/demo-preview.gif)](http://bfred-it.github.io/iphone-inline-video/demo/)

## Main features

- <2KB, standalone (no frameworks required)
- No setup: include it, call `enableInlineVideo(video)`, [done](#usage)
- No custom API for playback, you can just call `video.play()` on `click`
- Supports **audio**
- Supports [autoplay](#usage-with-autoplaying-videos) on silent videos
- Doesn't need canvas
- Doesn't create new elements/wrappers
- It works with existing players like jPlayer
- [Disabled automatically on iOS 10](#notes-about-ios-10)

Limitations:

- Needs user interaction to play videos with sound (standard iOS limitation)
- Limited to iPhone with iOS 8 and 9. iPad support needs to be [enabled separately.](#usage-on-ipad) It's disabled on Android.
- The video framerate depends on `requestAnimationFrame`, so avoid expensive animations and similar while the video is playing. Try [stats.js](https://github.com/mrdoob/stats.js/) to visualize your page's framerate
- [Known issues](https://github.com/bfred-it/iphone-inline-video/labels/known%20issue)

## Install

Pick your favorite:

```html
<script src="dist/iphone-inline-video.min.js"></script>
```

```sh
npm install --save iphone-inline-video
```

```js
var enableInlineVideo = require('iphone-inline-video');
```

```js
import enableInlineVideo from 'iphone-inline-video';
```

## Usage

You will need:

- a `<video>` element with the attribute `playsinline` (this is needed on iOS 10)

	```html
	<video src="file.mp4" playsinline></video>
	```
	
- the native play buttons will still trigger the fullscreen, so it's best to hide them when iphone-inline-video is enabled. [More info on the `.IIV` CSS class](https://github.com/bfred-it/iphone-inline-video/issues/72#issuecomment-247629743)

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
	enableInlineVideo(video);
	```
	
	```js
	// or if you're already using jQuery:
	var video = $('video').get(0);
	enableInlineVideo(video);
	```
	
	```js
	// or if you have multiple videos:
	$('video').each(function () {
		enableInlineVideo(this);
	});
	```

Done! It will only be enabled on iPhones and iPod Touch devices.

Now you can keep using it just like you would on a desktop. Run `video.play()`, `video.pause()`, listen to events with `video.addEventListener()` or `$(video).on()`, etc...

**BUT** you still need user interaction to play the audio, so do something like this:

```js
enableInlineVideo(video);
video.addEventListener('touchstart', function () {
	video.play();
});
```

If at some point you want to open the video in fullscreen, use the standard (but still prefixed) `webkitEnterFullScreen()` API, but it has some [caveats.](https://github.com/bfred-it/iphone-inline-video/issues/33)

## Usage with audio-less videos

If your video file doesn't have an audio track, then **you have to** set a `muted` attribute:

```html
<video muted playsinline src="video.mp4"></video>
```

## Usage with autoplaying videos

The `autoplay` attribute is also supported, if `muted` is set:

```html
<video autoplay muted playsinline src="video.mp4"></video>
```

Muted videos can also be played without user interaction — which means that `video.play()` doesn't need to be called inside an event listener:

```html
<video muted playsinline src="video.mp4"></video>
```
```js
setTimeout(function () { video.play(); }, 1000); // example
```

## Usage on iPad

The iPad already supports inline videos so IIV is not enabled there.

The only reason to enabled IIV on iPad:

- you want muted videos to autoplay, or
- you want to play videos without user interaction

To enabled IIV on the iPad:

```js
enableInlineVideo(video, {
	iPad: true
});
```

## Notes about iOS 10

New features in iOS 10:

* videos play inline:  

    ```html
    <video playsinline src="video.mp4"></video>
    ```

* muted videos play inline without user interaction:  

    ```html
    <video muted playsinline src="video.mp4"></video>
    ```
    ```js
    setTimeout(function () { video.play(); }, 1000); // example
    ```

* muted videos autoplay inline:  

    ```html
    <video autoplay muted playsinline src="video.mp4"></video>
    ```

Essentially everything that this module does, so `iphone-inline-video` will be automatically disabled on iOS 10. Make sure you use the `playsinline` attribute.

## License

MIT © [Federico Brigante](http://twitter.com/bfred_it)
