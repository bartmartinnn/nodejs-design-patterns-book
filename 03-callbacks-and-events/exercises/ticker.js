import { EventEmitter } from "node:events"

function ticker(number, cb) {
    const eventEmitter = new EventEmitter()
    let counter = 0
    while(number >= 50) {
        setTimeout(() => eventEmitter.emit('tick'), 50)
        counter++
        number = number - 50
        if (number < 50){
            cb(counter)
        }
    }
    return eventEmitter
}

ticker(200,(number) => console.log(`Finished with "${number}"`))
.on('tick', () => console.log('tick happened'))