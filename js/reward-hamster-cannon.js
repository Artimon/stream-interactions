let RewardHamsterCannon = (function ($) {

	'use strict';

	class CannonBall {
		/**
		 * @param $container
		 * @param {string} template
		 * @param {userContext} userContext
		 */
		constructor($container, template, userContext) {
			this._initialize($container, template, userContext);
		}

		/**
		 * @param $container
		 * @param {string} template
		 * @param {userContext} userContext
		 * @private
		 */
		_initialize($container, template, userContext) {
			let speed = 1000 + (Math.random() * Math.random()) * 1000,
				$html = $(template);

			$container.append($html);

			this._$html = $html;

			this._setChatterName($html, userContext);
			this._showRandomAvatar($html);

			this.right = parseFloat($html.css('right'));
			this.bottom = parseFloat($html.css('bottom'));
			this.speed = {
				x: speed,
				y: speed
			};
			this.rotation = -45;
			this.rotationSpeed = Random.clasp(20);
			this.size = 112;
			this.groundBounces = 0;
			
			this._start();
		}

		/**
		 * @private
		 */
		_start() {
			this._$html.removeClass('hide');

			window.setTimeout(() => {
				this._$html.addClass('load');
			}, 0);
		}

		/**
		 * @private
		 */
		_remove() {
			this._$html.addClass('hide');

			window.setTimeout(() => {
				this._$html.remove();
				this.removed = true;
			}, 500);
		}

		/**
		 * @param $html
		 * @param {userContext} userContext
		 * @private
		 */
		_setChatterName($html, userContext) {
			$html.find('.chatter-name')
				.css('color', userContext.color)
				.text(userContext.displayName);
		}

		/**
		 * @param $html
		 * @private
		 */
		_showRandomAvatar($html) {
			let $images = $html.find('.hamster-image'),
				image = Random.fromArray($images);

			image.classList.add('show');
		}

		fire() {
			this.fired = true;
			this._$html.addClass('fired');
		}

		/**
		 * @param {number} deltaTime
		 */
		move(deltaTime) {
			this.speed.y -= 350 * deltaTime;
			this.right += this.speed.x * deltaTime;
			this.bottom += this.speed.y * deltaTime;
			this.rotation += this.rotationSpeed * deltaTime;

			this._collisionDetection();

			this._$html.css({
				right: this.right + 'px',
				bottom: this.bottom + 'px',
				transform: `rotate(${this.rotation}deg)`
			});
		}

		/**
		 * @private
		 */
		_collisionDetection() {
			let leftBoundary = window.innerWidth - this.size,
				topBoundary = window.innerHeight - this.size,
				invertedDamping = -0.8,
				bounced = false,
				audio;

			if (this.right < 0) {
				this.right = 0;
				this.speed.x *= invertedDamping;
				bounced = true;
			}
			else if (this.right > leftBoundary) {
				this.right = leftBoundary;
				this.speed.x *= invertedDamping;
				bounced = true;
			}
			else if (this.bottom < 0) {
				this.bottom = 0;
				this.speed.y *= invertedDamping;
				bounced = true;

				this.groundBounces += 1;

				if (this.groundBounces >= 7) {
					this._remove();
				}
			}
			else if (this.bottom > topBoundary) {
				this.bottom = topBoundary;
				this.speed.y *= invertedDamping;
				bounced = true;
			}

			if (bounced) {
				this.speed.x += Random.clasp(this.speed.x * 0.2);
				this.speed.y += Random.clasp(this.speed.y * 0.2);
				this.rotationSpeed = (Math.random() * Math.random()) * Random.clasp(1000);

				audio = new Audio('snd/cartoon-boing.wav');
				audio.volume = 0.20;
				audio.play();
			}
		}
	}

	class RewardHamsterCannon {
		constructor() {
			this._$component = $('.component-hamster-cannon');
			this._$cannonContainer = $('.cannon-container');
			this._$smokeImages = this._$component.find('.smoke-image');
			this._$cannonBallContainer = this._$component.find('.cannon-ball-container');
			this._cannonBallTemplate = this._$component.find('.template-cannon-ball').html();

			this._audioCannon = new Audio('snd/cannon-crackle.wav');

			/**
			 * @type {CannonBall[]}
			 * @private
			 */
			this._cannonBalls = [];

			AnimationEngine.get().register('hamsterCannon', (deltaTime) => {
				this._cannonBalls.forEach((cannonBall, index) => {
					if (cannonBall.removed) {
						this._cannonBalls.splice(index, 1);

						return;
					}

					if (cannonBall.fired) {
						cannonBall.move(deltaTime);
					}
				});
			});

			this.coolDown = new CoolDown(15, () => {
				this._cannonActivate();
			});
		}

		_cannonActivate() {
			this._$cannonContainer.addClass('show');

			window.setTimeout(() => {
				let self = this,
					cannonBallUserContexts = this._getRandomCannonBallUserContexts();

				function nextCannonBall() {
					let userContext = cannonBallUserContexts.pop(),
						cannonBall = new CannonBall(
							self._$cannonBallContainer,
							self._cannonBallTemplate,
							userContext
						);

					self._cannonBalls.push(cannonBall);

					window.setTimeout(() => {
						self._cannonFire(cannonBall);
					}, 1000);

					if (cannonBallUserContexts.length === 0) {
						window.setTimeout(() => {
							self._$cannonContainer.removeClass('show');
						}, 2000);

						return;
					}

					window.setTimeout(() => {
						nextCannonBall();
					}, 2000);
				}

				nextCannonBall();
			}, 2000);
		}

		/**
		 * @returns {userContext[]}
		 * @private
		 */
		_getRandomCannonBallUserContexts() {
			let amount;

			if (Math.random() < .66) {
				return this._getCannonBallUserContexts();
			}

			amount = 1 + Math.ceil(Math.random() * 4);

			return this._getCannonBallUserContexts(amount);
		}

		/**
		 *
		 * @param {number} amount
		 * @returns {userContext[]}
		 * @private
		 */
		_getCannonBallUserContexts(amount = 1) {
			let chatters = ActiveChatters.get().getChatters(),
				chattersList = Object.values(chatters),
				result = [],
				userContext;

			while (result.length < amount && chattersList.length > 0) {
				userContext = Random.fromArray(chattersList);
				chattersList.removeItem(userContext);
				result.push(userContext.userContext);
			}

			if (result.length === 0) {
				userContext = ActiveChatters.get().getChatters(true);
				result.push(userContext[1].userContext);
			}

			return result;
		}

		/**
		 * @param {CannonBall} cannonBall
		 * @private
		 */
		_cannonFire(cannonBall) {
			let step = 0,
				handle;

			cannonBall.fire();

			this._audioCannon.play();

			handle = window.setInterval(() => {
				this._$smokeImages.removeClass('show');

				if (step > 13) {
					window.clearInterval(handle);

					return;
				}

				let smokeImage = this._$smokeImages.get(step);

				smokeImage.classList.add('show');

				step += 1;
			}, 80);
		}

		/**
		 * @param {userContext} userContext
		 */
		activate(userContext) {
			this.coolDown.trigger();
		}
	}

	return RewardHamsterCannon;

})(jQuery);

new RewardHamsterCannon();
