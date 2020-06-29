let RewardHamsterCannon = (function ($) {

	'use strict';

	class RewardHamsterCannon {
		constructor() {
			this._$component = $('.component-hamster-cannon');
			this._$cannonBall = this._$component.find('.cannon-ball');
			this._$chatterName = this._$cannonBall.find('.chatter-name');
			this._$smokeImages = this._$component.find('.smoke-image');

			this._audioCannon = new Audio('snd/cannon-crackle.wav');

			AnimationEngine.get().register('hamsterCannon', (deltaTime) => {
				if (this._isRunning) {
					this._moveCannonBall(deltaTime);
				}
			});

			this.coolDown = new CoolDown(30, () => {
				this._prepareShot();
			});
		}

		_prepareShot() {
			let cannonBallUserContext = this._getCannonBallUserContext()

			this._showRandomHamster();

			this._$component.addClass('show-cannon');

			window.setTimeout(() => {
				this._$chatterName
					.css('color', cannonBallUserContext.color)
					.text(cannonBallUserContext.displayName);

				this._$cannonBall.removeClass('hide');

				window.setTimeout(() => {
					this._$cannonBall.addClass('load');
				}, 0);

				window.setTimeout(() => {
					this._initializeShot();
				}, 2000);
			}, 1000);
		}

		_initializeShot() {
			let speed = 1000 + (Math.random() * Math.random()) * 1000;

			this._cannonSmoke();

			this._isRunning = true;

			this._$cannonBall.addClass('fired');

			this._cannonBall = {
				right: parseFloat(this._$cannonBall.css('right')),
				bottom: parseFloat(this._$cannonBall.css('bottom')),
				speed: {
					x: speed,
					y: speed
				},
				rotation: -45,
				rotationSpeed: Random.clasp(20),
				size: 112,
				groundBounces: 0
			};
		}

		/**
		 * @returns {userContext}
		 * @private
		 */
		_getCannonBallUserContext() {
			let chatters = ActiveChatters.get().getChatters(true),
				chattersList = Object.values(chatters);

			return Random.fromArray(chattersList).userContext;
		}

		/**
		 * @private
		 */
		_showRandomHamster() {
			let $images = this._$cannonBall.find('.hamster-image'),
				image = Random.fromArray($images);

			$images.removeClass('show');
			image.classList.add('show');
		}

		_cannonSmoke() {
			let step = 0,
				handle;

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
		 * @param {number} deltaTime
		 * @private
		 */
		_moveCannonBall(deltaTime) {
			this._cannonBall.speed.y -= 350 * deltaTime;
			this._cannonBall.right += this._cannonBall.speed.x * deltaTime;
			this._cannonBall.bottom += this._cannonBall.speed.y * deltaTime;
			this._cannonBall.rotation += this._cannonBall.rotationSpeed * deltaTime;

			this._collisionDetection();

			this._$cannonBall.css({
				right: this._cannonBall.right + 'px',
				bottom: this._cannonBall.bottom + 'px',
				transform: `rotate(${this._cannonBall.rotation}deg)`
			});
		}

		_collisionDetection() {
			let leftBoundary = window.innerWidth - this._cannonBall.size,
				topBoundary = window.innerHeight - this._cannonBall.size,
				invertedDamping = -0.8,
				bounced = false,
				audio;

			if (this._cannonBall.right < 0) {
				this._cannonBall.right = 0;
				this._cannonBall.speed.x *= invertedDamping;
				bounced = true;
			}
			else if (this._cannonBall.right > leftBoundary) {
				this._cannonBall.right = leftBoundary;
				this._cannonBall.speed.x *= invertedDamping;
				bounced = true;
			}
			else if (this._cannonBall.bottom < 0) {
				this._cannonBall.bottom = 0;
				this._cannonBall.speed.y *= invertedDamping;
				bounced = true;

				this._cannonBall.groundBounces += 1;

				if (this._cannonBall.groundBounces >= 7) {
					this._resetCannonBall();
				}
			}
			else if (this._cannonBall.bottom > topBoundary) {
				this._cannonBall.bottom = topBoundary;
				this._cannonBall.speed.y *= invertedDamping;
				bounced = true;
			}

			if (bounced) {
				this._cannonBall.speed.x += Random.clasp(this._cannonBall.speed.x * 0.2);
				this._cannonBall.speed.y += Random.clasp(this._cannonBall.speed.y * 0.2);
				this._cannonBall.rotationSpeed = (Math.random() * Math.random()) * Random.clasp(1000);

				console.log(this._cannonBall.rotationSpeed);

				audio = new Audio('snd/cartoon-boing.wav');
				audio.volume = 0.20;
				audio.play();
			}
		}

		_resetCannonBall() {
			this._$cannonBall
				.addClass('hide')
				.removeClass('fired');

			this._$component.removeClass('show-cannon');

			window.setTimeout(() => {
				this._$cannonBall
					.removeClass('load')
					.removeAttr('style');

				this._isRunning = false;
			}, 500);
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
