
class RewardWeather {
	constructor() {
		this._$component = $('.component-weather');
		this._$rainDrops = this._$component.find('.weather-rain-drop');

		this._windSpeed = 4;
		this._isRunning = false;

		this._audioRainHeavy = new Audio('snd/rain-heavy-loop.wav');
		this._audioRainHeavy.loop = true;
		this._audioRainHeavy.volume = 0;

		this._audioRainModerate = new Audio('snd/rain-moderate-loop.wav');
		this._audioRainModerate.loop = true;
		this._audioRainModerate.volume = 0;

		this._$audioRainModerate = $(this._audioRainModerate);
		this._$audioRainHeavy = $(this._audioRainModerate);

		this._handles = {};

		this._clip = {
			width: this._$component.width(),
			height:  this._$component.height()
		};

		this.coolDown = new CoolDown(10, () => {
			this._isRunning
				? this.stop()
				: this.start();
		});

		$(window).resize(() => {
			this._clip.width = this._$component.width();
			this._clip.height = this._$component.height();
		});
	}

	activate() {
		this.coolDown.trigger();
	}

	start() {
		this._$component.addClass('show');

		Math.random() > 0.5
			? this.startRain()
			: this.startStorm();
	}

	stop() {
		this._isRunning = false;

		this._$audioRainModerate.animate({ volume: 0 }, 1000);
		this._$audioRainHeavy.animate({ volume: 0 }, 1000);
		this._$component.removeClass('show');

		window.setTimeout(() => {
			window.clearInterval(this._handles.windSpeedChangeTransition);
			window.clearTimeout(this._handles.windSpeedChange);
			window.clearTimeout(this._handles.lightning);
		}, 650);

		window.setTimeout(() => {
			this._audioRainModerate.pause();
			this._audioRainHeavy.pause();
		}, 1000);
	}

	startRain() {
		this._animateWeather();

		this._audioRainModerate.play();
		this._$audioRainModerate.animate({ volume: 0.035 }, 1000);
		this._$component.removeClass('storm').addClass('rain');
	};

	startStorm() {
		var changeWindSpeedDelay = Math.round(Math.random() * 10000),
			lightningDelay = 2500 + Math.round(Math.random() * 5000);

		this._animateWeather();

		this._audioRainHeavy.play();
		this._$audioRainHeavy.animate({ volume: 0.035 }, 1000);
		this._$component.removeClass('rain').addClass('storm');

		this._handles.windSpeedChange = window.setTimeout(() => {
			this._changeWindSpeed();
		}, changeWindSpeedDelay);

		this._handles.lightning = window.setTimeout(() => {
			this._lightning();
		}, lightningDelay);
	};

	_animateWeather() {
		var self = this,
			lastTime = Date.now();

		this._initialize();
		this._isRunning = true;
		this._windSpeed = 4;

		this._$component.removeClass('rain-fast').addClass('rain-slow');

		function animate() {
			var time = Date.now(),
				deltaTime = (time - lastTime) / 1000;

			lastTime = time;

			self._move(deltaTime);

			if (self._isRunning) {
				requestAnimationFrame(animate);
			}
		}

		animate();
	}

	_initialize() {
		this._$rainDrops.each((index, element) => {
			element.rainDropPosition = {
				left: Math.round(Math.random() * this._clip.width),
				top: Math.round(Math.random() * this._clip.height)
			};

			element.fallSpeed = this._minRangRandom(15, 2);
		});
	};

	/**
	 * @param {number} deltaTime
	 * @private
	 */
	_move(deltaTime) {
		var offset;

		this._$rainDrops.each((index, element) => {
			offset = element.rainDropPosition;
			offset.left += this._windSpeed * 50 * deltaTime;
			offset.top += element.fallSpeed * 50 * deltaTime;

			if (
				offset.left > this._clip.width ||
				offset.top > this._clip.height
			) {
				offset.left = Math.round(Math.random() * this._clip.width) - 15 * this._windSpeed;
				offset.top = -20;
			}

			element.style.left = offset.left + 'px';
			element.style.top = offset.top + 'px';
		});
	};


	_increaseWindSpeed() {
		this._windSpeed += 0.5;

		if (this._windSpeed > 12) {
			this._$component.removeClass('rain-slow').addClass('rain-fast');
		}

		if (this._windSpeed >= 16) {
			this._windSpeed = 16;

			this._stopChangeWindSpeed();
		}
	};

	_decreaseWindSpeed() {
		this._windSpeed -= 0.5;

		if (this._windSpeed < 8) {
			this._$component.removeClass('rain-fast').addClass('rain-slow');
		}

		if (this._windSpeed <= 4) {
			this._windSpeed = 4;

			this._stopChangeWindSpeed();
		}
	};

	_stopChangeWindSpeed() {
		var delay = 5000 + Math.round(Math.random() * 10000);

		window.clearInterval(this._handles.windSpeedChangeTransition);

		this._handles.windSpeedChange = window.setTimeout(() => {
			this._changeWindSpeed();
		}, delay);
	};

	_changeWindSpeed() {
		if (this._windSpeed <= 4) {
			this._handles.windSpeedChangeTransition = window.setInterval(() => {
				this._increaseWindSpeed();
			}, 100);
		}
		else {
			this._handles.windSpeedChangeTransition = window.setInterval(() => {
				this._decreaseWindSpeed();
			}, 100);
		}
	};

	/**
	 * @param {number} min
	 * @param {number} range
	 * @returns {number}
	 * @private
	 */
	_minRangRandom(min, range) {
		return min + Math.round(Math.random() * range);
	}

	_lightning() {
		var hasActiveLightning = this._$component.hasClass('lightning'),
			delay;

		if (hasActiveLightning) {
			this._$component.removeClass('lightning');

			if (Math.random() < 0.4) {
				delay = this._minRangRandom(75, 35);
			}
			else {
				delay = this._minRangRandom(5000, 5000);
			}
		}
		else {
			this._$component.addClass('lightning');

			delay = this._minRangRandom(35, 25);
		}

		this._handles.lightning = window.setTimeout(() => {
			this._lightning();
		}, delay);
	};
}
