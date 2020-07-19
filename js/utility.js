let Random = {
	fromArray(array) {
		return array[Math.floor(Math.random() * array.length)];
	},

	/**
	 * @param {[]} array
	 * @returns {[]}
	 */
	shuffleArray(array) {
		let result = [];

		while (array.length > 0) {
			let item = Random.fromArray(array);

			result.push(item);
			array.removeItem(item);
		}

		return result;
	},

	/**
	 * @param {number} range
	 * @returns {number}
	 */
	clasp(range) {
		return Math.random() * (2 * range) - range;
	},

	/**
	 * Integer from from to to.
	 *
	 * @param {number} from
	 * @param {number} to
	 * @returns {number}
	 */
	range(from, to) {
		return Math.floor(from + Random.frandom(to - from + 1));
	},

	/**
	 * From 0 to given multiplier.
	 *
	 * @param {number} multiplier
	 * @returns {number}
	 */
	frandom(multiplier) {
		return Math.random() * multiplier;
	},

	/**
	 * @param {number} value
	 * @returns {number}
	 */
	gauss: function (value) {
		let selector,
			difference;

		selector = Math.random() * 50;

		if (selector > 20) {
			difference = 0.05; // 60% chance for +/- 5%
		}
		else if (selector > 5) {
			difference = 0.15; // 30% chance for +/- 15%
		}
		else {
			difference = 0.25; // 10% chance for +/- 25%
		}

		if (Math.random() < 0.5) {
			difference = -difference;
		}

		// Modify result by +/- 2%
		difference += ((Math.random() * 4) - 2) / 100;

		return value * (1 + difference);
	}
}

class CoolDown {
	/**
	 * @param {number} delaySeconds
	 * @param {function} callback
	 */
	constructor(delaySeconds, callback) {
		this._delay = delaySeconds * 1000;
		this._action = callback;
		this._promise = null;

		this._userContexts = [];
	}

	/**
	 * @param {userContext} [userContext]
	 */
	trigger(userContext) {
		if (this._promise) {
			this._userContexts.push(userContext);

			return;
		}

		this._action(userContext);

		this._promise = window.setTimeout(() => {
			this._promise = null;

			if (this._userContexts.length > 0) {
				let userContext = this._userContexts.shift();

				this.trigger(userContext);
			}
		}, this._delay);
	}
}

class ActiveChatters {
	/**
	 * @param {userContext} defaultUserContext
	 */
	constructor(defaultUserContext) {
		let chattersString = LocalStorage.getItem('chatters', '{}');

		this._chatters = JSON.parse(chattersString);
		this._defaultUserContext = defaultUserContext;
	}

	static get() {
		if (!ActiveChatters._instance) {
			ActiveChatters._instance = new ActiveChatters({
				displayName: 'Artimus',
				color: '#8A2BE2'
			});
		}

		return ActiveChatters._instance;
	}

	/**
	 * @param {userContext} userContext
	 */
	add(userContext) {
		let excludeNames = ['nightbot', 'pretzelrocks', 'jostmkbot', 'sparkofsharkbot', 'sparkofsharkclone'],
			userId = userContext.userId,
			timestamp = Date.now(),
			chattersString;

		if (excludeNames.includes(userContext.displayName.toLowerCase())) {
			return;
		}

		if (!this._chatters[userId]) {
			this._chatters[userId] = {
				userContext: userContext
			};
		}

		this._chatters[userId].timestamp = timestamp;

		chattersString = JSON.stringify(this._chatters)
		LocalStorage.setItem('chatters', chattersString);
	}

	/**
	 * @param {boolean} [defaultIfNone]
	 * @returns {any}
	 */
	getChatters(defaultIfNone) {
		let timestamp = Date.now(),
			active = 20 * 60 * 1000;

		$.each(this._chatters, (index, chatter) => {
			if (chatter.timestamp < timestamp - active) {
				delete this._chatters[index];
			}
		});

		if (
			defaultIfNone &&
			Object.values(this._chatters).length === 0
		) {
			return {
				1: {
					timestamp: 0,
					userContext: this._defaultUserContext
				}
			};
		}

		return this._chatters;
	}

	/**
	 * @param {boolean} [defaultIfNone]
	 * @returns {userContext[]}
	 */
	getUserContexts(defaultIfNone) {
		let chatters = Object.values(
			this.getChatters(defaultIfNone)
		);

		return Random.shuffleArray(
			chatters.map(chatter => chatter.userContext)
		);
	}

	/**
	 * @param {userContext[]} userContexts
	 * @param {userContext} userContext
	 */
	removeUserContextFromList(userContexts, userContext) {
		userContexts.forEach((checkUserContext) => {
			if (checkUserContext.userId === userContext.userId) {
				userContexts.removeItem(checkUserContext);
			}
		});
	}
}

class LocalStorage {
	/**
	 * @param {string} key
	 * @param {string|boolean|number} item
	 */
	static setItem = function(key, item) {
		localStorage.setItem(key, item);
	};

	/**
	 * @param {string} key
	 * @param {string|boolean|number|null} fallback
	 * @returns {string|boolean|number|null}
	 */
	static getItem = function(key, fallback) {
		if (fallback === undefined) {
			fallback = null ;
		}
		try {
			var item = localStorage.getItem(key);
			if (item === null ) {
				return fallback;
			}
			if (item === 'true') {
				return true;
			}
			if (item === 'false') {
				return false;
			}
			return isNaN(item) ? item : parseFloat(item);
		}
		catch (exception) {
			return fallback;
		}
	};

	/**
	 * @param {string} key
	 */
	static removeItem = function(key) {
		localStorage.removeItem(key);
	};
}

class AnimationEngine {
	constructor() {
		this._callbacks = {};
	}

	/**
	 * @returns {AnimationEngine}
	 */
	static get() {
		if (!AnimationEngine._instance) {
			AnimationEngine._instance = new AnimationEngine();
		}

		return AnimationEngine._instance;
	}

	start() {
		let self = this,
			lastTime = Date.now();

		function loop() {
			let time = Date.now(),
				deltaTime = (time - lastTime) / 1000;

			lastTime = time;

			$.each(self._callbacks, function (index, callback) {
				callback(deltaTime);
			});

			requestAnimationFrame(loop);
		}

		// window.setInterval(loop, 1000 / 30);
		requestAnimationFrame(loop);
	}

	register(name, callback) {
		this._callbacks[name] = callback;
	}
}

/**
 * @param {*} item
 */
Array.prototype.removeItem = function (item) {
	let index = this.indexOf(item);

	if (index === -1) {
		return;
	}

	this.splice(index, 1);
};
