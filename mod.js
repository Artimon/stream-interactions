class StreamInteraction {
	constructor(io) {
		this.io = io;

		this._initialize();
	}

	_initialize() {
		this.io.sockets.on('connection', (socket) => {
			this.socket = socket;
		});
	}

	/**
	 * @param {userContext} userContext
	 * @param {string} message
	 */
	chatMessage(userContext, message) {
		if (!this.socket) {
			return;
		}

		this.socket.emit('streamInteraction:chatMessage', {
			userContext: userContext,
			message: message
		});
	}

	/**
	 * @param {userContext} userContext
	 * @param {string} rewardId
	 */
	redemption(userContext, rewardId) {
		if (!this.socket) {
			return;
		}

		this.socket.emit('streamInteraction:redemption', {
			userContext: userContext,
			rewardId: rewardId
		});
	}
}

/*
class MyMod {
	constructor(io) {
	}

	chatMessage(userContext, message) {
	}

	redemption(userId, rewardId) {
	}
}
 */

module.exports = StreamInteraction;
