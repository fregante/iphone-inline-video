'use strict';
export default function proxyEvent(object, eventName, sourceObject) {
	sourceObject.addEventListener(eventName, () => object.dispatchEvent(new Event(eventName)));
}
