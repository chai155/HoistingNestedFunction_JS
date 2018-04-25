function getCountDown(countdownValue){
    function countdown(value) { //hoistable
        if (value > 0) {
            return countdown(value - 1);
        } else {
        return value;
        }
    }
    return countdown(countdownValue);
}

module.exports = {
    getCountDown: getCountDown
}
