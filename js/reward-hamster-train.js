let RewardHamsterTrain = (function ($) {

	'use strict';

	class RewardHamsterTrain {
		constructor() {
			this.$component = $('.component-hamster-train');
			this.$hamsterTrain = this.$component.find('.hamster-train');
			this.$hamsterTrack = this.$component.find('.hamster-track');
			this.templateLocomotive = this.$component.find('.template-hamster-train-locomotive').html();
			this.templateWaggon = this.$component.find('.template-hamster-train-waggon').html();
			this.templateSmoke = this.$component.find('.template-hamster-train-smoke').html();

			this._audioTrain = new Audio('snd/steam-train-loop.wav');
			this._audioWhistle = new Audio('snd/steam-train-whistle.wav');

			this._blockerHandle = null;
			this._transitionTime = 3000;

			// this._createWaggon({
			// 	color: 'FF0000',
			// 	displayName: 'Lolerskater'
			// });
		}

		/**
		 * @param {userContext} userContext
		 * @private
		 */
		_createTrain(userContext) {
			this.$hamsterTrain.html('');
			this._createLocomotive(userContext);
			this._createWaggons(userContext);
			this._run();
		}

		/**
		 * @param {userContext} userContext
		 * @private
		 */
		_createWaggons(userContext) {
			let activeChatters = ActiveChatters.get(),
				excludeNames = ['nightbot', 'pretzelrocks', 'jostmkbot', 'sparkofsharkbot', 'sparkofsharkclone'],

				chatters = activeChatters.getChatters();

			$.each(chatters, (index, chatter) => {
				if (userContext.userId === chatter.userContext.userId) {
					return;
				}

				if (excludeNames.includes(chatter.userContext.displayName.toLowerCase())) {
					return;
				}

				this._createWaggon(chatter.userContext);
			});
		}

		_createLocomotive(userContext) {
			this._$locomotive = this._createTrainCar(userContext, this.templateLocomotive);
		}

		/**
		 * @param {userContext} userContext
		 * @private
		 */
		_createWaggon(userContext) {
			this._createTrainCar(userContext, this.templateWaggon, ($html) => {
				this._makeVariationImageVisible($html, '.waggon-image');
			});
		}

		/**
		 * @param {userContext} userContext
		 * @param {string} template
		 * @param {function} [modifierCallback
		 * @private
		 */
		_createTrainCar(userContext, template, modifierCallback) {
			let $html = $(template);

			this._makeVariationImageVisible($html, '.passenger-image');

			$html.find('.passenger-name')
				.css('color', userContext.color)
				.text(userContext.displayName);

			modifierCallback && modifierCallback($html);

			this.$hamsterTrain.append($html);

			return $html;
		}

		/**
		 * @param {*} $html
		 * @param {string} selector
		 * @private
		 */
		_makeVariationImageVisible($html, selector) {
			let $images = $html.find(selector),
				image = Random.fromArray($images);

			image.classList.add('show');
		}

		_run() {
			let duration = this._move();

			this._wheels();
			this._audio(duration);
			this._track(duration);
			this._smoke(duration);

			this._delayBlocker(duration);
		}

		/**
		 * @param {number} duration
		 * @private
		 */
		_delayBlocker(duration) {
			let blockerDuration = duration + (2 * this._transitionTime) + 4000;

			this._blockerHandle = window.setTimeout(() => {
				this._blockerHandle = null;

				if (this._nextUserContext) {
					this.activate(this._nextUserContext);
					this._nextUserContext = null;
				}
			}, blockerDuration);
		}

		/**
		 * @param {number} duration
		 * @private
		 */
		_track(duration) {
			let removeDuration = duration + this._transitionTime * 2;

			this.$hamsterTrack.addClass('show');

			window.setTimeout(() => {
				this.$hamsterTrack.removeClass('show');
			}, removeDuration);
		}

		/**
		 * @param {number} duration
		 * @private
		 */
		_smoke(duration) {
			let self = this,
				stopDuration = duration + this._transitionTime,
				handle;

			/**
			 * @param {number} step
			 * @param $html
			 */
			function process(step, $html, $smokeImages) {
				if (step === 0) {
					self.$component.append($html);
				}

				if (step >= 13) {
					$html.remove();
					return;
				}

				if (!$smokeImages) {
					$smokeImages = $html.find('.smoke-image');
				}

				$smokeImages.removeClass('show');
				$smokeImages.get(step).classList.add('show');

				window.setTimeout(() => {
					process(++step, $html, $smokeImages);
				}, 150);
			}

			handle = window.setInterval(() => {
				let offset = this._$locomotive.offset(),
					$html;

				offset.left += 80;
				offset.top += 10;

				if (
					offset.left <= 0 ||
					offset.left >= document.documentElement.clientWidth) {
					return;
				}

				$html = $(this.templateSmoke);
				$html.css({
					left: offset.left + 'px',
					top: offset.top + 'px'
				});

				process(0, $html);
			}, 350);

			window.setTimeout(() => {
				window.clearInterval(handle);
			}, stopDuration);
		}

		_wheels() {
			let $wheels = this.$component.find('.waggon-wheel');

			$wheels.each((index, element) => {
				let alternate = Math.random() > .5;

				element.classList.toggle('alternate', alternate);
			});

			if (this.promise) {
				window.clearInterval(this.promise);
			}

			this.promise = window.setInterval(() => {
				$wheels.toggleClass('alternate');
			}, 100);
		}

		/**
		 * @returns {number}
		 * @private
		 */
		_move() {
			let viewportWidth = $(window).width(),
				trainWidth = this.$hamsterTrain.width(),
				distance = viewportWidth + trainWidth,
				duration = distance * 4;

			this.$hamsterTrain.css({
				left: (viewportWidth + 20) + 'px',
				transition: 'none'
			});

			window.setTimeout(() => {
				this.$hamsterTrain.css({
					left: -trainWidth + 'px',
					transition: `left ${duration}ms linear`
				});
			}, this._transitionTime);

			return duration;
		}

		/**
		 * @param {number} duration
		 * @private
		 */
		_audio(duration) {
			let handle,
				volume = 0.5,
				currentVolume = 0,
				fadeOutDuration = duration + this._transitionTime,
				silenceDuration = duration + 2 * this._transitionTime;

			this._audioTrain.loop = true;
			this._audioTrain.volume = currentVolume;
			this._audioTrain.play();

			this._audioWhistle.volume = 0.5;
			this._audioWhistle.play();

			handle = window.setInterval(() => {
				let change = 0.5 / (60 * 3);

				currentVolume += volume === 0
					? -change
					: change;

				currentVolume = Math.min(
					0.5, Math.max(0, currentVolume)
				);

				this._audioTrain.volume = currentVolume;
			}, 1000 / 60);

			window.setTimeout(() => {
				volume = 0;
			}, fadeOutDuration);

			window.setTimeout(() => {
				window.clearInterval(handle);
				this._audioTrain.pause();
			}, silenceDuration);

			if (Math.random() > .5) {
				return;
			}

			window.setTimeout(() => {
				this._audioWhistle.play();
			}, duration / 3 + Math.random() * duration / 2);
		}

		/**
		 * @param {userContext} userContext
		 */
		activate(userContext) {
			if (this._blockerHandle) {
				this._nextUserContext = userContext;

				return;
			}

			this._createTrain(userContext);
		}
	}

	return RewardHamsterTrain;

})(jQuery);
