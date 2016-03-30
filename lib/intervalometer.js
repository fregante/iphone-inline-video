'use strict';
export default function getIntervalometer(cb) {
	const raf = {
		start() {
			if (!raf.lastCall) {
				raf.lastCall = Date.now();
			}
			cb(Date.now() - raf.lastCall);
			raf.lastCall = Date.now();
			raf.id = requestAnimationFrame(raf.start);
		},
		stop() {
			cancelAnimationFrame(raf.id);
			delete raf.id;
			delete raf.lastCall;
		}
	};
	return raf;
}
