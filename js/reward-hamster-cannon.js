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
			let speed = 1000 + (Math.random() * Math.random()) * 1000, // Top speed ~2800 for audio.
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
			this.radius = this.size / 2;
			this.mass = 1 + Math.random();
			
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

		isActive() {
			let inactive = (
				this.removed ||
				!this.fired
			)

			return !inactive;
		}

		getSpeed() {
			return this.getLength(this.speed.x, this.speed.y);
		}

		getAngle() {
			return Math.atan2(this.speed.y, this.speed.x);
		}

		/**
		 * @param {CannonBall} cannonBall
		 * @returns {number}
		 */
		getDistance(cannonBall) {
			return this.getLength(
				this.right - cannonBall.right,
				this.bottom - cannonBall.bottom
			);
		}

		/**
		 * @param {number} a
		 * @param {number} b
		 * @returns {number}
		 */
		getLength(a, b) {
			return Math.sqrt(a ** 2 + b ** 2);
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
		 * @param {number} distance
		 */
		moveBy(distance) {
			let baseDistance = this.getLength(this.speed.x, this.speed.y),
				movementFactor = distance / baseDistance;

			this.right += this.speed.x * movementFactor;
			this.bottom += this.speed.y * movementFactor;
		}

		/**
		 * @private
		 */
		_collisionDetection() {
			let leftBoundary = window.innerWidth - this.size,
				topBoundary = window.innerHeight - this.size,
				invertedDamping = -0.8,
				bounced = false;

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

				if (this.speed.y < 150) {
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

				this._changeRotation();
				this._playBoingSound();
			}
		}

		_playBoingSound() {
			let audio = new Audio('snd/cartoon-boing.wav'),
				speed = this.getSpeed(),
				volumeFactor = 0.2 + 0.8 * (speed / 1500); // Max. speed is roughly 2800.

			audio.volume = 0.20 * Math.min(1, volumeFactor);
			audio.play();
		}

		_changeRotation() {
			if (Math.random() < .66) {
				this.rotationSpeed += Random.clasp(250);

				return;
			}

			this.rotationSpeed = (Math.random() * Math.random()) * Random.clasp(1000);
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
			this._audioCannonChains = new Audio('snd/cannon-chains.wav');

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

				this._ballCollision();
			});

			this.coolDown = new CoolDown(15, () => {
				this._cannonActivate();
			});
		}

		_ballCollision() {
			for (let i = 0; i < this._cannonBalls.length - 1; i++) {
				for (let j = i + 1; j < this._cannonBalls.length; j++) {
					this._processBallCollision(
						this._cannonBalls[i],
						this._cannonBalls[j]
					);
				}
			}
		}

		/**
		 * @param {CannonBall} cannonBall1
		 * @param {CannonBall} cannonBall2
		 * @private
		 */
		_processBallCollision(cannonBall1, cannonBall2) {
			if (
				!cannonBall1.isActive() ||
				!cannonBall2.isActive()
			) {
				return;
			}

			let dist = cannonBall1.getDistance(cannonBall2);
			if (dist >= cannonBall1.radius + cannonBall2.radius) {
				return;
			}

			let theta1 = cannonBall1.getAngle();
			let theta2 = cannonBall2.getAngle();
			let phi = Math.atan2(cannonBall2.bottom - cannonBall1.bottom, cannonBall2.right - cannonBall1.right);
			let m1 = cannonBall1.mass;
			let m2 = cannonBall2.mass;
			let v1 = cannonBall1.getSpeed();
			let v2 = cannonBall2.getSpeed();

			let dx1F = (v1 * Math.cos(theta1 - phi) * (m1 - m2) + 2 * m2 * v2 * Math.cos(theta2 - phi)) / (m1 + m2) * Math.cos(phi) + v1 * Math.sin(theta1 - phi) * Math.cos(phi + Math.PI / 2);
			let dy1F = (v1 * Math.cos(theta1 - phi) * (m1 - m2) + 2 * m2 * v2 * Math.cos(theta2 - phi)) / (m1 + m2) * Math.sin(phi) + v1 * Math.sin(theta1 - phi) * Math.sin(phi + Math.PI / 2);
			let dx2F = (v2 * Math.cos(theta2 - phi) * (m2 - m1) + 2 * m1 * v1 * Math.cos(theta1 - phi)) / (m1 + m2) * Math.cos(phi) + v2 * Math.sin(theta2 - phi) * Math.cos(phi + Math.PI / 2);
			let dy2F = (v2 * Math.cos(theta2 - phi) * (m2 - m1) + 2 * m1 * v1 * Math.cos(theta1 - phi)) / (m1 + m2) * Math.sin(phi) + v2 * Math.sin(theta2 - phi) * Math.sin(phi + Math.PI / 2);

			cannonBall1.speed.x = dx1F;
			cannonBall1.speed.y = dy1F;
			cannonBall2.speed.x = dx2F;
			cannonBall2.speed.y = dy2F;

			this._collisionMoveApart(cannonBall1, cannonBall2);
		}

		/**
		 * @param {CannonBall} cannonBall1
		 * @param {CannonBall} cannonBall2
		 * @private
		 */
		_collisionMoveApart(cannonBall1, cannonBall2) {
			let realDistance = cannonBall1.getDistance(cannonBall2),
				requiredDistance = cannonBall1.radius + cannonBall2.radius,
				moveDistance = requiredDistance - realDistance;

			if (moveDistance <= 0) {
				return;
			}

			cannonBall1.moveBy(moveDistance);
		}

		_cannonActivate() {
			this._$cannonContainer.addClass('show');
			this._playCannonChainsSound();

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
							self._playCannonChainsSound();
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

		_playCannonChainsSound() {
			this._audioCannonChains.loop = true;
			this._audioCannonChains.volume = 0.15;
			this._audioCannonChains.play();

			window.setTimeout(() => {
				this._audioCannonChains.animate({ volume: 0 }, 200);
			}, 800);

			window.setTimeout(() => {
				this._audioCannonChains.pause();
			}, 1000);
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
			this.coolDown.trigger(userContext);
		}
	}

	return RewardHamsterCannon;

})(jQuery);
