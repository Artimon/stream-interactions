let RewardHamsterRockets = (function ($) {

	'use strict';

	class HamsterRocket {
		/**
		 * @param $container
		 * @param {string} template
		 * @param {userContext} userContext
		 * @param {number} leftOffset
		 */
		constructor($container, template, userContext, leftOffset) {
			this._$container = $container;

			this._initialize(template, userContext, leftOffset);
		}

		/**
		 * @param {string} template
		 * @param {userContext} userContext
		 * @param {number} leftOffset
		 * @private
		 */
		_initialize(template, userContext, leftOffset) {
			let $html = $(template),
				$pilot = $html.find('.component-hamster'),
				rocketClassName;

			rocketClassName = Math.random() > 0.5
				? 'hamster-9'
				: 'saturn-v';

			$html.addClass(rocketClassName).css('left', `${leftOffset}%`);
			$pilot.hamster(userContext);

			this._$container.append($html);
			this._$html = $html;

			this._start();
		}

		_start() {
			window.setTimeout(() => {
				this._$html.remove();
			}, 4000);
		}
	}

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
				amount = 1;

			if (Math.random() > .66) {
				amount = Random.range(2, 5);
			}

			this._launchRockets(userContexts, amount);
		}

		/**
		 * @param {userContext[]} userContexts
		 * @param {number} amount
		 * @private
		 */
		_launchRockets(userContexts, amount) {
			let offset = 100 / (amount + 1);

			while (amount > 0) {
				let userContext = userContexts.pop();

				if (!userContext) {
					break;
				}

				this._createRocket(userContext, offset * amount);

				amount -= 1;
			}
		}

		/**
		 * @param {userContext} userContext
		 * @param {number} offset
		 * @private
		 */
		_createRocket(userContext, offset) {
			let delay = Random.frandom(2);

			window.setTimeout(() => {
				new HamsterRocket(this._$rocketContainer, this._rocketTemplate, userContext, offset);
			}, delay * 1000);
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
