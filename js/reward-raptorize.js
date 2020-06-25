let RewardRaptorize = (function ($) {

	'use strict';

	class RewardRaptorize {
		constructor() {
			this.$body = $('body');
			this.$body.raptorize();
			this.coolDown = new CoolDown(10, () => {
				this.$body.click();
			});
		}

		activate() {
			this.coolDown.trigger();
		}
	}

	return RewardRaptorize;

})(jQuery);
