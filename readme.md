# iphone-inline-video

> Make videos playable inline on Safari on iPhone and iPod touch.

[![gzipped size](https://badges.herokuapp.com/size/github/bfred-it/iphone-inline-video/gh-pages/dist/iphone-inline-video.browser.js?gzip=true&label=gzipped%20size)](#readme) [![iOS 8 supported](https://img.shields.io/badge/iOS%20Safari-8-brightgreen.svg)](#no-link) [![iOS 9 supported](https://img.shields.io/badge/iOS%20Safari-9-brightgreen.svg)](#no-link)

This module doesn't use any canvas, it plays the video inline by seeking it manually rather than technically _playing_ it. It works best when the video has audio so it uses that to synchronize.

Try the demo: http://bfred-it.github.io/iphone-inline-video/

## Usage

```js
import makeVideoPlayableInline from 'iphone-inline-video';
const video = document.querySelector('video');

// this enables the inline playback
makeVideoPlayableInline(video);

// the video element will be played inline through its standard methods,
// but it still needs user interaction to start the download
// fullscreen can still be achievable via the normal requestFullscreen() API
video.addEventListener('touchstart', () => video.play());
```

In you don't use browserify/webpack/rollup/babel, include this:

```html
<script src="dist/iphone-inline-video.browser.js"></script>
```

## Known issues

 * It cannot go fullscreen before it's played inline first
 * It cannot keep playing when the src is changed
 * Unknown behavior when no audio + slow connection

## License

MIT © [Federico Brigante](http://twitter.com/bfred_it)
