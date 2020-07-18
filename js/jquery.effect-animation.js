(function ($) {
	'use strict';

	$.fn.effectAnimation = function (durationBetweenFrames) {
		let $frames = this.find('.animation-image'),
			step = 0,
			handle;

		handle = window.setInterval(() => {
			let frame = $frames.get(step);

			$frames.removeClass('show');

			if (!frame) {
				window.clearInterval(handle);

				return;
			}

			frame.classList.add('show');

			step += 1;
		}, durationBetweenFrames);

		return this;
	};

})(jQuery);
