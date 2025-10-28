import { EventEmitter } from "node:events"

function ticker(number, cb) {
    const eventEmitter = new EventEmitter()
    let counter = 0

    function checkIfDateDivisibleBy5(){
        if (Date.now() % 5 === 0) {
            eventEmitter.emit('error')
            cb('divisible by 5', number)
            return true
        } else {
            return false
        }
    }

    function tick() {
        setTimeout(() => {
            eventEmitter.emit('tick')
            counter++
            number -= 50
            if (number < 50){
                cb(null, counter)
            } else if (checkIfDateDivisibleBy5()) {

            } else {
                tick()
            }
        }, 50)
    }

    process.nextTick(() => {
        checkIfDateDivisibleBy5()
        eventEmitter.emit('tick')
        counter++
    })

    tick()
    return eventEmitter
}

ticker(200,(error, number) => {
    if (error) {
        console.log(`callback error "${error}"`)
    } else {
        console.log(`Finished with "${number}"`)
    }

})
.on('tick', () => console.log('tick happened'))
.on('error', () => console.log('error happened!'))