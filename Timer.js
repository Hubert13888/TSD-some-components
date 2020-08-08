export default class Timer {
    time = {
        minutes: 0,
        seconds: 0
    }
    timer1 = setInterval(() => this.timer(), 1000)

    constructor(minutes, seconds) {
        this.setTime(minutes, seconds)
    }

    timer() {
        if(this.time.seconds == 0) {
            this.time.minutes--
            this.time.seconds = 59
        }
        else this.time.seconds--

        if(this.time.minutes == 0 && this.time.seconds == 0) {
            return clearInterval(this.timer1)
        }
    }
    setTime(minutes, seconds){
        this.time.minutes = minutes
        this.time.seconds = seconds
        clearInterval(this.timer1)
        this.timer1 = setInterval(() => this.timer(), 1000)
    }
    getTime(){
        return this.time
    }
};