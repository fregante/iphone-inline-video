'use strict';
export default function getIntervalometer (cb) {
	var raf = {
		start: function () {
			if (!raf.startTime) {
				raf.startTime = Date.now();
			}
			cb(Date.now() - raf.startTime, raf.startTime);
			raf.id = requestAnimationFrame(raf.start);
		},
		stop: function () {
			cancelAnimationFrame(raf.id);
			delete raf.id;
			delete raf.startTime;
		}
	};
	return raf;
}
