'use strict';
export default function proxyProperty(object, propertyName, sourceObject) {
	Object.defineProperty(object, propertyName, {
		get: () => sourceObject[propertyName],
		set: va => {
			sourceObject[propertyName] = va;
		}
	});
}
