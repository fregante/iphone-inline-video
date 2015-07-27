'use strict';
export default function getIntervalometer (cb) {
	var raf = {
		start: function () {
			if (!raf.lastCall) {
				raf.lastCall = Date.now();
			}
			cb(Date.now() - raf.lastCall);
			raf.lastCall = Date.now();
			raf.id = requestAnimationFrame(raf.start);
		},
		stop: function () {
			cancelAnimationFrame(raf.id);
			delete raf.id;
			delete raf.lastCall;
		}
	};
	return raf;
}
