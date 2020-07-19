let RewardFlyingHamsman = (function ($) {

	'use strict';

	class CannonBall {
		/**
		 * @param $cannonBall
		 * @param offset
		 * @param {number} index
		 */
		constructor($cannonBall, offset, index) {
			this.$cannonBall = $cannonBall;
			this._offset = offset;
			this._index = index;
			
			this._scale = 0.25;
			this._scaleSpeed = 0;
			this._rotation = Random.clasp(180);
			this._rotationSpeed = Random.clasp(700);
			this._speedX = Random.clasp(100);
			this._speedY = 600 + Random.clasp(200);
			this._stopDuration = 2;

			this._slideTopSpeed = 60 + Math.random() * 40;

			this._impacted = false;
			this._impactAudio = new Audio('snd/ship-cannon-splat.wav');
		}

		/**
		 * @param {number} deltaTime
		 * @returns {boolean}
		 */
		animate(deltaTime) {
			if (this._scale < 1.65) {
				this._fly(deltaTime);

				return;
			}

			this._stopDuration -= 2.5 * deltaTime;

			if (this._stopDuration < 0) {
				this._slide(deltaTime);
			}

			if (!this._impacted) {
				this._impacted = true;
				this._speedY = 0;

				this._playImpactSound();
			}

			if (this._offset.top > 1500) {
				return false;
			}
		}

		_playImpactSound() {
			this._impactAudio.volume = 0.05;
			this._impactAudio.play();
		}

		/**
		 * @param {number} deltaTime
		 * @private
		 */
		_fly(deltaTime) {
			let zIndex;

			this._scale += (this._scaleSpeed * this._scaleSpeed) * deltaTime;
			this._rotation += this._rotationSpeed * deltaTime;
			this._offset.left += this._speedX * deltaTime;
			this._offset.top -= this._speedY * deltaTime;

			this._scaleSpeed += 1.4 * deltaTime;
			this._speedY -= 600 * deltaTime;

			zIndex = (
				1000 +
				-this._index * 100 +
				this._scale * 1000
			);

			this.$cannonBall.css({
				left: this._offset.left + 'px',
				top: this._offset.top + 'px',
				zIndex: Math.round(zIndex),
				transform: `scale(${this._scale}) rotate(${this._rotation}deg)`
			});
		}

		/**
		 * @param {number} deltaTime
		 * @private
		 */
		_slide(deltaTime) {
			this._offset.top -= this._speedY * deltaTime;

			this._speedY = Math.min(
				this._slideTopSpeed,
				this._speedY - 50 * deltaTime
			);

			this.$cannonBall.css('top', this._offset.top + 'px');
		}
	}

	class RewardFlyingHamsman {
		constructor() {
			this._$component = $('.component-flying-hamsman');
			this._$flyingHamsman = this._$component.find('.flying-hamsman');
			this._$cannonFire = this._$component.find('.cannon-fire');
			this._$gunPorts = this._$component.find('.gun-port');

			this._$hamsterCaptain = this._$component.find('.hamster-captain');
			this._$hamsterCrew = this._$component.find('.hamster-crew');

			this._cannonBallTemplate = this._$component.find('.template-hamster-cannon-ball').html();

			this._cannonBallsAnimation = [];

			this._initialize();

			this.coolDown = new CoolDown(45, (userContext) => {
				this._start(userContext);
			});
		}

		_initialize() {
			this._initializeGunFireEffectAnimations();
			
			AnimationEngine.get().register('flyingHamsman', (deltaTime) => {
				this._cannonBallsAnimation.forEach((cannonBall) => {
					let finished = cannonBall.animate(deltaTime) === false;
					
					if (finished) {
						this._removeCannonBall(cannonBall);
					}
				});
			});
		}

		_initializeGunFireEffectAnimations() {
			let template = this._$component.find('.template-flying-hamsman-cannon-fire').html();

			this._$gunPorts.each(() => {
				this._$cannonFire.append(template);
			});
		}

		/**
		 * @param {userContext} userContext
		 */
		_start(userContext) {
			let activeChatters = ActiveChatters.get(),
				userContexts = activeChatters.getUserContexts();

			activeChatters.removeUserContextFromList(userContexts, userContext);

			this._$hamsterCaptain.hamster(userContext);
			this._$hamsterCrew.hamster(userContexts.pop());

			this._fireCannonSalves(userContexts);
			this._resetShip();
		}

		_resetShip() {
			let leftStart = -(this._$flyingHamsman.width() + 100),
				leftEnd = window.innerWidth + 100;

			this._$flyingHamsman
				.removeClass('animate')
				.css('left', leftStart + 'px');

			window.setTimeout(() => {
				this._$flyingHamsman
					.addClass('animate')
					.css('left', leftEnd + 'px');
			}, 350);
		}

		/**
		 * @param {userContext[]} userContexts
		 * @private
		 */
		_fireCannonSalves(userContexts) {
			let flyDuration = 24000,
				salves = Random.range(1, 3),
				delay = flyDuration / (salves + 1);

			for (let i = 1; i <= salves; ++i) {
				window.setTimeout(() => {
					this._fireCannons(userContexts);
				}, 1000 + 3000 + delay * i);
			}
		}

		/**
		 * @param {userContext[]} userContexts
		 * @private
		 */
		_fireCannons(userContexts) {
			let delay = 0;

			this._$cannonFire.find('.component-effect-animation').each((index, effectAnimation) => {
				let gunPort = this._$gunPorts.get(index),
					$gunPort = $(gunPort);

				window.setTimeout(() => {
					let userContext = userContexts.pop();

					if (!userContext) {
						return;
					}

					this._fireCannon($gunPort, effectAnimation, userContext, index);
				}, delay);

				delay += 1000;
			});
		}

		/**
		 * @param $gunPort
		 * @param effectAnimation
		 * @param {userContext} userContext
		 * @param {number} [index]
		 * @private
		 */
		_fireCannon($gunPort, effectAnimation, userContext, index = 0) {
			let $effectAnimation = $(effectAnimation),
				offset = $gunPort.offset(),
				audio = new Audio('snd/cannon-crackle.wav');

			offset.left += $gunPort.width() / 2 + 30; // Little movement compensation.
			offset.top += $gunPort.height() / 2;

			$effectAnimation.css({
				left: offset.left + 'px',
				top: offset.top + 'px'
			});

			$effectAnimation.effectAnimation(80);

			this._createCannonBall(offset, userContext, index);

			audio.play();
		}

		/**
		 * @param offset
		 * @param {userContext} userContext
		 * @param {number} index
		 * @private
		 */
		_createCannonBall(offset, userContext, index) {
			let $cannonBall = $(this._cannonBallTemplate);

			$cannonBall.hamster(userContext);
			
			this._addCannonBall($cannonBall, offset, index);
		}

		/**
		 * @param $cannonBall
		 * @param offset
		 * @param {number} index
		 * @private
		 */
		_addCannonBall($cannonBall, offset, index) {
			let cannonBall = new CannonBall($cannonBall, offset, index);
			
			this._$component.append($cannonBall);
			this._cannonBallsAnimation.push(cannonBall);
		}

		/**
		 * @param {CannonBall} cannonBall
		 * @private
		 */
		_removeCannonBall(cannonBall) {
			cannonBall.$cannonBall.remove();

			this._cannonBallsAnimation.removeItem(cannonBall);
		}

		/**
		 * @param {userContext} userContext
		 */
		activate(userContext) {
			this.coolDown.trigger(userContext);
		}

	}

	return RewardFlyingHamsman;

})(jQuery);

