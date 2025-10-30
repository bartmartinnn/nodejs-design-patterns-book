import { readFile, writeFile } from 'node:fs'
import { join } from 'node:path'

function concatFiles(srcFile1, srcFile2, dest, cb){
    // copy the contents of every source file into the destination file
    // respecting the order of the files, as in the arg list
    readFile(srcFile1, (err, data1) => {
        readFile(srcFile2, (err, data2) => {
            console.log(data1.toString(), data2.toString())
            let content = data1.toString() + data2.toString()
            writeFile(dest, content, cb)
        })
    })
}

concatFiles('./foofile.txt', './barfile.txt', './destfile.txt', () => {
    console.log('finished')
})