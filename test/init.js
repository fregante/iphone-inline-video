import test from 'ava';
import enableInlineVideo from '..';

test.beforeEach(t => {
	t.context.video = document.createElement('video');
});

test('is whitelisted on iPhone', t => {
	enableInlineVideo(t.context.video);
	t.true(enableInlineVideo.isWhitelisted);
});

test('is enabled when whitelisted', t => {
	t.pass(2);
	enableInlineVideo(t.context.video);
	t.true(enableInlineVideo.isWhitelisted);
	t.true(t.context.video.classList.contains('IIV'));
});
