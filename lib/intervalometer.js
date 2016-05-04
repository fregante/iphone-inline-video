'use strict';
export default function Intervalometer(cb) {
	let rafId;
	let previousLoopTime;
	function loop(now) {
		// must be requested before cb() because that might call .stop()
		rafId = requestAnimationFrame(loop);
		cb(now - (previousLoopTime || now)); /* ms since last call. 0 if first call */
		previousLoopTime = now;
	}
	this.start = () => {
		if (!rafId) { // prevent double starts
			loop(Date.now());
		}
	};
	this.stop = () => {
		cancelAnimationFrame(rafId);
		rafId = null;
	};
}
