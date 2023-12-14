import CONFIG from "../config";

var initializeLevelState = function () {
    var levelState = {level: 1};

    saveLevelState(levelState);

    return levelState;
};

var saveLevelState = function (state) {
    localStorage.setItem(CONFIG.CHILLSECT_LEVEL_STATE_KEY, JSON.stringify(state));
};

var validateLevelState = function (levelState) {
    return levelState
        && levelState.hasOwnProperty("level") &&
        levelState.level > 0 &&
        levelState.level <= CONFIG.MAX_LEVEL
};

var isGameEnd = function () {

    const state = getLevelState();
    return state.gameCompleted === true;

};

var increaseLevel = function () {

    var state = getLevelState();

    if (state.level >= CONFIG.MAX_LEVEL) {
        state.gameCompleted = true;
    } else {
        state.level++;
    }

    saveLevelState(state);

};

var resetLevelState = function () {

    initializeLevelState();

};

var getLevelState = function () {

    var levelState;
    try {
        levelState = JSON.parse(localStorage.getItem(CONFIG.CHILLSECT_LEVEL_STATE_KEY));
    } catch (e) {
    }

    if (validateLevelState(levelState)) {
        return levelState;
    }
    return initializeLevelState();
};

export default {
    isGameEnd,
    getLevelState,
    increaseLevel,
    resetLevelState
};