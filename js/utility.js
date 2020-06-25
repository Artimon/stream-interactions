let Random = {
	fromArray(array) {
		return array[Math.floor(Math.random() * array.length)];
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
		this._repeats = 0;
		this._promise = null;
	}

	trigger() {
		if (this._promise) {
			this._repeats += 1;

			return;
		}

		this._action();

		this._promise = window.setTimeout(() => {
			this._promise = null;

			if (this._repeats > 0) {
				this._repeats -= 1;
				this.trigger();
			}
		}, this._delay);
	}
}

class ActiveChatters {
	constructor() {
		this._chatters = {};
	}

	static get() {
		if (!ActiveChatters._instance) {
			ActiveChatters._instance = new ActiveChatters();
		}

		return ActiveChatters._instance;
	}

	/**
	 * @param {userContext} userContext
	 */
	add(userContext) {
		let userId = userContext.userId,
			timestamp = Date.now();

		if (!this._chatters[userId]) {
			this._chatters[userId] = {
				userContext: userContext
			};
		}

		this._chatters[userId].timestamp = timestamp;
	}

	getChatters() {
		let timestamp = Date.now(),
			active = 20 * 60 * 1000;

		$.each(this._chatters, (index, chatter) => {
			if (chatter.timestamp < timestamp - active) {
				delete this._chatters[index];
			}
		});

		return this._chatters;
	}
}
