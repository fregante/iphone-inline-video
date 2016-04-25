'use strict';
export default function Intervalometer(cb) {
	this.start = now => {
		// prevent double starts
		// now is only passed by raf
		// id is only present when it's already started
		// if it's not a raf call, only do it if it's not started yet
		if (now || !this.id) {
			// must be called before cb() because that might call .stop()
			this.id = requestAnimationFrame(this.start);
			cb(now - (this.prev || now)); /* ms since last call. 0 if first call */
			this.prev = now;
		}
	};
	this.stop = () => {
		cancelAnimationFrame(this.id);
		delete this.id;
		delete this.prev;
	};
}
