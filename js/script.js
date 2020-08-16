/* globals io */

class RewardHalloweenBats {
	constructor() {
		this.$body = $('body');

		this.halloweenBats = $.halloweenBats({
			image: 'img/bats.png' // Path to the image.
		});

		this.halloweenBats.stop();
	}

	activate() {
		this.$body.toggleClass('show-halloween-bats');

		if (this.$body.hasClass('show-halloween-bats')) {
			this.halloweenBats.start();
		}
		else {
			this.halloweenBats.stop();
		}
	}
}

class RewardSnowfall {
	activate() {
		document.body.classList.toggle('show-snowfall');
	}
}


class StreamInteractionProcessor {
	constructor(io) {
		this.io = io;
		this.rewards = {}

		this._initialize();
	}

	_initialize() {
		this.socket = this.io.connect(); // io.connect(document.URL.split('#')[0]);

		this._registerListeners();
	}

	_registerListeners() {
		let activeChatters = ActiveChatters.get();

		this.socket.on('streamInteraction:chatMessage', (payload) => {
			//console.log(payload);
			activeChatters.add(payload.userContext);
		});

		this.socket.on('streamInteraction:redemption', (payload) => {
			let reward = this.rewards[payload.rewardId];

			console.log(payload.rewardId);
			// console.log(payload);

			if (!reward) {
				return;
			}

			reward.activate(payload.userContext);
		});
	}

	/**
	 * @param {string} rewardId
	 * @param reward
	 */
	registerReward(rewardId, reward) {
		this.rewards[rewardId] = reward;
	}

	/**
	 * @param {string} selector
	 * @param reward
	 */
	registerRewardFromMeta(selector, reward) {
		let $meta = $(selector),
			rewardId = $meta.attr('content');

		this.registerReward(rewardId, reward);
	}
}

$(function () {
	let processor = new StreamInteractionProcessor(io);

	AnimationEngine.get().start();

	processor.registerReward('f19f7e5f-f760-4a1b-84b6-3517761a88ad', new RewardRaptorize());
	processor.registerReward('086b49ae-a6b9-4d70-b710-fce8a8bd4154', new RewardWeather());
	//processor.registerReward('06aa7f74-82d6-40b8-8b8a-888b22daf781', new RewardSnowfall());
	processor.registerRewardFromMeta('.chat-train', new RewardHamsterTrain());
	processor.registerRewardFromMeta('.chat-cannon', new RewardHamsterCannon());
	processor.registerRewardFromMeta('.chat-flying-ship', new RewardFlyingHamsman());
	processor.registerRewardFromMeta('.chat-rockets', new RewardHamsterRockets());

});
