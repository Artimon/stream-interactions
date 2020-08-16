let RewardHamsterRockets = (function ($) {

	'use strict';

	class RewardHamsterRockets {
		constructor() {
			this._$component = $('.component-hamster-rockets');
			this._$rocketContainer = this._$component.find('.rocket-container');
			this._rocketTemplate = this._$component.find('.template-hamster-rocket').html();

			this.coolDown = new CoolDown(15, () => {
				this._start();
			});
		}

		_start() {
			let activeChatters = ActiveChatters.get(),
				userContexts = activeChatters.getUserContexts(),
				userContext = userContexts.pop();

			this._createRocket(userContext);
		}

		/**
		 * @param {userContext} userContext
		 * @private
		 */
		_createRocket(userContext) {
			let $html = $(this._rocketTemplate),
				$pilot = $html.find('.component-hamster');

			$pilot.hamster(userContext);

			this._$rocketContainer.append($html);
		}

		/**
		 * @param {userContext} userContext
		 */
		activate(userContext) {
			this.coolDown.trigger(userContext);
		}
	}

	return RewardHamsterRockets;

}(jQuery));
