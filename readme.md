# iphone-inline-video

> Make videos playable inline on Safari on iPhone and iPod touch.

[![gzipped size](https://badges.herokuapp.com/size/github/bfred-it/iphone-inline-video/gh-pages/dist/iphone-inline-video.browser.js?gzip=true&label=gzipped%20size)](#readme) [![iOS 8 and 9.3 supported](https://img.shields.io/badge/iOS%20Safari-8%20%E2%80%93%209.3-brightgreen.svg)](#no-link) [![Travis build status](https://api.travis-ci.org/bfred-it/iphone-inline-video.svg?branch=gh-pages)](https://travis-ci.org/bfred-it/iphone-inline-video) 

This module plays the video inline by seeking it manually rather than technically _playing_ it. 

No new elements are created, once the fix is applied you can keep using your `video` just like you would before, you can feed it to jPlayer or use it on a canvas if you want. 

It works best when the video has audio so it uses that to synchronize, but it works without it anyway.

Try the demo: http://bfred-it.github.io/iphone-inline-video/

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
video::-webkit-media-controls {
  display:none;
}
```

And then run it on a single `<video>` element:

```js
const video = document.querySelector('video');
makeVideoPlayableInline(video);
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


## Known issues

* Many events and other properties are still supported, but changing [`src` isn't yet](https://github.com/bfred-it/iphone-inline-video/issues/1), so you can't play videos back-to-back yet.
* You need to `.play()` the video before `webkitEnterFullScreen()` if you still want that at some point.
* Unknown behavior when the video file has no audio track and the file is slow to load

## License

MIT © [Federico Brigante](http://twitter.com/bfred_it)
