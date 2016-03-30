'use strict';
export default function preventEvent(element, eventName, toggleProperty, preventWithProperty) {
	const handler = function (e) {
		const hasProperty = toggleProperty && element[toggleProperty];
		delete element[toggleProperty];
		if (Boolean(hasProperty) === Boolean(preventWithProperty)) {
			e.stopImmediatePropagation();
			// console.log(eventName, 'prevented on', element);
		}
	};
	element.addEventListener(eventName, handler, false);
	return {
		forget: () => element.removeEventListener(eventName, handler, false)
	};
}
