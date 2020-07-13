class RewardRaptorize {
    constructor() {
        var raptor = new Raptor();
        this.coolDown = new CoolDown(10, () => {
            raptor.trigger();
        });
    }

    activate() {
        this.coolDown.trigger();
    }
}