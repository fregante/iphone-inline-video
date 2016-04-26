'use strict';
/*
Poor man's Symbol implementation, not compliant
Defaults to the browser's Symbol if available

http://www.2ality.com/2014/12/es6-symbols.html#symbols_as_property_keys

Ideal to be used instead of: obj.___hiddenProp
as: obj[Symbol('hidden-prop')]

Usage example:

import Symbol from './poor-mans-symbol';
const ಠ = Symbol('my-nice-module');
el[ಠ] = 'Some private stuff';

*/
export default Symbol === undefined ? function (description) {
	return '@' + (description || '@') + Math.random().toString(26);
} : Symbol;
