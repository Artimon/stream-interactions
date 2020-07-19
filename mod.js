class StreamInteraction {
	/**
	 * @param {function} sendCallback
	 */
	constructor(sendCallback) {
		this._sendCallback = sendCallback;
	}

	/**
	 * @param {userContext} userContext
	 * @param {string} message
	 */
	chatMessage(userContext, message) {
		this._sendCallback('streamInteraction:chatMessage', {
			userContext: userContext,
			message: message
		});
	}

	/**
	 * @param {userContext} userContext
	 * @param {string} rewardId
	 */
	redemption(userContext, rewardId) {
		this._sendCallback('streamInteraction:redemption', {
			userContext: userContext,
			rewardId: rewardId
		});
	}
}

/*
class MyMod {
	constructor(sendCallback) {
		this._sendCallback = sendCallback;
	}

	chatMessage(userContext, message) {
	}

	redemption(userId, rewardId) {
	}
}
 */

module.exports = StreamInteraction;
