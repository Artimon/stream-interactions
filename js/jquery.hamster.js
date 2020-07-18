(function ($) {
	'use strict';

	/**
	 * @param {userContext} userContext
	 * @returns {jQuery}
	 */
	$.fn.hamster = function (userContext) {
		let $images = this.find('.hamster-image'),
			image;

		$images.removeClass('show');

		if (!userContext) {
			return this;
		}

		image = Random.fromArray($images);

		image.classList.add('show');

		this.find('.hamster-name')
			.css('color', userContext.color)
			.text(userContext.displayName);

		return this;
	};

})(jQuery);
