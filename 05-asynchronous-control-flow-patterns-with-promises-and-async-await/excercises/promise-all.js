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
        if (promises.length === 0) {
            return resolve([])
        }
    return resolve([])
    })
}

export { createDelayedPromise, createRejectedPromise, myPromiseAll }