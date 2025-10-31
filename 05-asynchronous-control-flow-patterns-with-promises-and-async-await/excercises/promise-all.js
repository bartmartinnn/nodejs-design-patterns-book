function createDelayedPromise(value, delay) {
  return new Promise((resolve) => {
    setTimeout(resolve, delay, value)
  })
}

function createRejectedPromise(error, delay) {
  return new Promise((resolve, reject) => {
    setTimeout(reject, delay, error)
  })
}

// Example custom Promise.all implementation to test
function myPromiseAll(promises) {
  return new Promise((resolve, reject) => {
    // Handle empty array
    if (promises.length === 0) {
      return resolve([])
    }
    
    const results = new Array(promises.length)
    let completedCount = 0
    
    promises.forEach((promise, index) => {
      // Convert non-promises to promises
      Promise.resolve(promise)
        .then(value => {
          results[index] = value
          completedCount++
          
          if (completedCount === promises.length) {
            resolve(results)
          }
        })
        .catch(error => {
          reject(error) // Fail fast on first rejection
        })
    })
  })
}

export { createDelayedPromise, createRejectedPromise, myPromiseAll }