import { stat, readdir } from 'node:fs'
import {join} from 'node:path'

function listNestedFiles(path, cb){
    let listOfFiles = []
    let bloat = {
        'bloatName': '',
        'bloatSize': 0
    } 
    stat(path, (err, stats) => {
        if (err) {
            console.error('Error reading path')
            return
        }

        if (!stats.isDirectory()){
            console.log('not a directory!')
            return cb()
        }

        readdir(path, (err, files) => {
            if (err) {
                console.error('Error reading path')
                return
            }
            let pending = files.length

            if (pending === 0) {
                console.log('directory is empty')
                return
            }

            for(let i=0; i<files.length; i++) {
                const filePath = join(path, files[i])
                listOfFiles.push(filePath)
            }

            return cb(null, listOfFiles)
        })
    })
}

listNestedFiles('./', (err, listOfFiles) => {
    console.log('List of files in cb: ')
    for(let i = 0; i< listOfFiles.length; i++){
        console.log(listOfFiles[i], '\n')
    }
})