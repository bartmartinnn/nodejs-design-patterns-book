import { readFile, writeFile } from 'node:fs'

function concatFiles(dest, cb, ...files){
    //there can be multiple files
    let content = ''
    function iterate (index) {
        if (index === files.length){
            writeFile(dest, content, cb)
            return cb()
        }
        const file = files[index]
        readFile(file, (err, data) => { 
            if(err){
                return cb()
            }
            content += data.toString()
            iterate(index+1)
        })
    }
    iterate(0)
}

concatFiles('./destfile.txt', () => {
    console.log('finished')
}, './foofile.txt', './barfile.txt', './bgfile.txt')