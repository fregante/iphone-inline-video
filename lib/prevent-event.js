'use strict';
export default function preventEvent (element, eventName, toggleProperty, preventWithProperty) {
	var handler = function (e) {
		let hasProperty = toggleProperty && element[toggleProperty];
		delete element[toggleProperty];
		if (!!hasProperty === !!preventWithProperty) {
			e.stopImmediatePropagation();
			// console.log(eventName, 'prevented on', element);
		}
	};
	element.addEventListener(eventName, handler, false);
	return {
		forget: () => element.removeEventListener(eventName, handler, false)
	};
}
