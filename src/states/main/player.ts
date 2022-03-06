import State from "../../engine/state";

export default class Player {
    public state: State;
    public money: number;
    public kyberCrystal: number;
    public enemyKilled: number;
    public objectDestroyed: number;
    constructor(state: State) {

        this.state = state;

        this.money = 0;
        this.kyberCrystal = 0;
        this.enemyKilled = 0;
        this.objectDestroyed = 0;
    }
}