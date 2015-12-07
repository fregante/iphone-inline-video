# iPhone Inline Video

Make videos playable inline on Safari on iPhone and iPod touch. Tested in iOS 8 and 9

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
