'use strict';
export default function getIntervalometer(cb) {
	const raf = {
		start() {
			if (!raf.lastCall) {
				raf.lastCall = Date.now();
			}
			const timeDiffSinceLastCycle = Date.now() - raf.lastCall;
			raf.id = requestAnimationFrame(raf.start);
			raf.lastCall = Date.now();

			// must be after raf() because it might call .stop()
			cb(timeDiffSinceLastCycle);
		},
		stop() {
			cancelAnimationFrame(raf.id);
			delete raf.id;
			delete raf.lastCall;
		}
	};
	return raf;
}
