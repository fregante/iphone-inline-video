// because of https://github.com/lukechilds/node-browser-environment/issues/1
const jsdom = require('jsdom').jsdom;

function setup(props, overwrite) {
	const presetProps = props instanceof Array ? props : false;
	const window = jsdom('<html><body></body></html>', {
		userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1'
	}).defaultView;

	window.Audio = function Audio() {
		if (!(this instanceof Audio)) {
			throw new Error('Use as constructor');
		}
		return window.document.createElement('audio');
	};

	Object
		.keys(window)
		.filter(prop => typeof global[prop] === 'undefined' || presetProps && overwrite)
		.filter(prop => !(presetProps && props.indexOf(prop) === -1))
		.forEach(prop => {
			global[prop] = window[prop];
		});

	return window;
}
setup();
