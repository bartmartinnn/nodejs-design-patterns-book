import { stat, readdir } from 'node:fs'
import {join} from 'node:path'

function listNestedFiles(path, cb){
    let listOfFiles = []
    function iterate(path, cb) {
        stat(path, (err, stats) => {
            if (err) {
                console.error('Error reading path', err.message)
                return cb(err)
            }

            if (!stats.isDirectory()){
                console.log('not a directory!')
                return cb(null, [])
            }

            readdir(path, (err, files) => {
                if (err) {
                    console.error('Error reading path')
                    return cb(err)
                }

                let pending = files.length

                if (pending === 0) {
                    console.log('directory is empty')
                    return cb(null, [])
                }

                let results = []

                for(let i=0; i<files.length; i++) {
                    const filePath = join(path, files[i])
                    stat(filePath, (err, stats) => {
                        if (err){
                            console.log('error in inner stat: ', err)
                            pending--
                            if (pending === 0) {
                                cb(null, listOfFiles)
                            }
                            return
                        }
                        if (stats.isDirectory()){
                            console.log('have a directory here:', files[i])
                            iterate(filePath, (err, subFiles) => {
                                if (!err && subFiles) {
                                    listOfFiles.push(...subFiles)
                                }
                                pending--
                                if(pending ===0){
                                    cb(null, listOfFiles)
                                }
                            })
                        } else {
                            listOfFiles.push(filePath)
                            pending--
                            if(pending === 0) {
                                cb(null, listOfFiles)
                            }
                        }
                    })
                }
            })
        })
    }
    iterate(path, (err, files) => {
        if(err){
            return cb(err)
        }
        cb(null, listOfFiles)
})
}

listNestedFiles('./', (err, listOfFiles) => {
    console.log('List of files in cb: ')
    for(let i = 0; i< listOfFiles.length; i++){
        console.log(listOfFiles[i], '\n')
    }
})