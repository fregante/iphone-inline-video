'use strict';
/*
File imported from: https://github.com/bfred-it/poor-mans-symbol
Until I configure rollup to import external libs into the IIFE bundle
*/
export default typeof Symbol === 'undefined' ? function (description) {
	return '@' + (description || '@') + Math.random();
} : Symbol;
