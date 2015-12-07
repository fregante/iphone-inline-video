# iPhone Inline Video

Make videos playable inline on Safari on iPhone and iPod touch. Tested in iOS 8 and 9

## Usage

```js
import makeVideoPlayableInline from 'iphone-inline-video';
const video = document.querySelector('video');

// this enables the inline playback
makeVideoPlayableInline(video);

// once enabled, the video element is enabled to be played inline from anything else, but it still needs user interaction to start the download
video.addEventListener('touchstart', () => video.play());
```
