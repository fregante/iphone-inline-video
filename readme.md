# iphone-inline-video

> Make videos playable inline on Safari on iPhone (prevents automatic fullscreen)

[![gzipped size](https://badges.herokuapp.com/size/github/bfred-it/iphone-inline-video/gh-pages/dist/iphone-inline-video.browser.js?gzip=true&label=gzipped%20size)](#readme) [![iOS 8 and 9.3 supported](https://img.shields.io/badge/iOS%20Safari-8%20%E2%80%93%209.3-brightgreen.svg)](#no-link) [![Travis build status](https://api.travis-ci.org/bfred-it/iphone-inline-video.svg?branch=gh-pages)](https://travis-ci.org/bfred-it/iphone-inline-video)  [![npm version](https://img.shields.io/npm/v/iphone-inline-video.svg)](https://www.npmjs.com/package/iphone-inline-video) 

[[DEMO]](http://bfred-it.github.io/iphone-inline-video/) - [[AUTOPLAY DEMO]](http://bfred-it.github.io/iphone-inline-video/)

## Main features

- No special setup needed, it works with a normal `mp4` file and a normal `<video>` element
- It plays the video's audio in sync ([if present](#usage-with-audio-less-videos))
- No additional elements are created or necessary
- No special API, it enhances the original `<video>` element so its methods and events are [mostly intact](https://github.com/bfred-it/iphone-inline-video/issues/1)
- It doesn't use canvas, so no expensive paints
- [`autoplay` support](#usage-with-autoplaying-videos) for silent videos

This module plays the video inline by seeking it manually rather than technically _playing_ it. 

Once you use it, you can keep using your `video` element just like you would before, you can feed it to jPlayer or use it on a canvas if you want.

## Install

```sh
npm install --save iphone-inline-video
```
```js
import makeVideoPlayableInline from 'iphone-inline-video';
```

If you don't use node/babel, include this:

```html
<script src="dist/iphone-inline-video.browser.js"></script>
```

## Usage

You will need this CSS to hide the play button overlay:
```css
video::-webkit-media-controls-start-playback-button {
  display:none;
}
```

And then run it on a single `<video>` element:

```js
makeVideoPlayableInline(video);
/* 

Where "video" is a variable containg a video element, like

var video = document.querySelector('video');

or this if you're already using jQuery:

var video = $('video').get(0);

*/
```

Done! You don't even need to check whether it's necessary, it's skipped outside iPhones and iPods.

Once you enable the `video` element with that function, you can keep using it just like you would on a desktop. Run `video.play()`, `video.pause()`, listen to events with `video.addEventListener()` or `$(video).on()`, etc...

*BUT* you still need user interaction to download and start playing it, so you'll need something like this:

```js
video.addEventListener('touchstart', function () {
	video.play();
});
```

If at some point you want to open the video in fullscreen, use the standard (but still prefixed) `webkitEnterFullScreen()` API.

## Usage with audio-less videos

If your video doesn't have an audio track, then you need this:

```js
makeVideoPlayableInline(video, /* hasAudio */ false);
```

This uses a different behavior to play the video, so it might not be particularly reliable on slow connections. It's untested.

## Usage with autoplaying videos

You can also have **silent** videos autoplay. This module can load and play the video without user interaction, but not play the audio, so you **have to** set the `hasAudio` to `false`

```js
makeVideoPlayableInline(video, /* hasAudio */ false);
```

Once that's run, if `video` has the `autoplay` attribute, it will automatically start playing:

```html
<video autoplay src="video.mp4"></video>
```

## Extras

* [Known issues](https://github.com/bfred-it/iphone-inline-video/labels/known%20issue)
* [Changelog](CHANGELOG.md)

## License

MIT © [Federico Brigante](http://twitter.com/bfred_it)
