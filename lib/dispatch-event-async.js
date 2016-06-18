export default function dispatchEventAsync(element, type) {
	Promise.resolve().then(() => {
		element.dispatchEvent(new Event(type));
	});
}
