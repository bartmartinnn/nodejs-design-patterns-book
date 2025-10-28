import { stat, readdir } from 'node:fs'
import {join} from 'node:path'

function findBloat(path){
    let bloat = {
        'bloatName': '',
        'bloatSize': 0
    } 
    stat(path, (err, stats) => {
        if (err) {
            console.error('Error reading path')
            return
        }

        if (stats.isDirectory()){
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
                    stat(filePath, (err, stat) => {
                        if (err) {
                            console.error('Error reading ', filePath)
                        } else {
                            console.log(stat.size)
                            if (stat.size > bloat.bloatSize){
                                bloat['bloatSize'] = stat.size
                                bloat['bloatName'] = files[i]
                            }
                        }
                        pending--

                        if (pending === 0){
                            console.log('Largest file: ', bloat)
                        }
                    })
                }
            })
        } else {
            console.log('not a directory!')
        };
    })
}

findBloat('./')