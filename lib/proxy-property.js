'use strict';
export default function proxyProperty(object, propertyName, sourceObject, copyFirst) {
	function get() {
		return sourceObject[propertyName];
	}
	function set(value) {
		sourceObject[propertyName] = value;
	}

	if (copyFirst) {
		set(object[propertyName]);
	}

	// TODO: only set setter on writable props
	Object.defineProperty(object, propertyName, {get, set});
}
