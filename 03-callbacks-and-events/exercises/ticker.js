import { EventEmitter } from "node:events"

function ticker(number, cb) {
    const eventEmitter = new EventEmitter()
    let counter = 0

    function tick() {
        setTimeout(() => {
            eventEmitter.emit('tick')
            counter++
            number -= 50
            if (number < 50){
                cb(counter)
            } else {
                tick()
            }
        }, 50)
    }

    tick()
    return eventEmitter
}

ticker(200,(number) => console.log(`Finished with "${number}"`))
.on('tick', () => console.log('tick happened'))