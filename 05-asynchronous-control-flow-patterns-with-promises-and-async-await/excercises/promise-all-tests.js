import { myPromiseAll, createDelayedPromise, createRejectedPromise } from "./promise-all.js"

async function testPromiseAllImplementation(customPromiseAll) {
  console.log('🧪 Testing Promise.all implementation...\n')
  
  // Add global unhandled rejection handler for debugging
  const originalRejectionHandler = process.listeners('unhandledRejection')
  process.on('unhandledRejection', (reason, promise) => {
    console.log('🚨 DEBUG: Unhandled promise rejection detected:')
    console.log('   Reason:', reason.message || reason)
    console.log('   Promise:', promise)
  })
  
  const tests = [
    {
      name: 'Empty array',
      input: [],
      description: 'Should resolve immediately with empty array',
      createInput: () => []
    },
    {
      name: 'Single resolved promise',
      input: null,
      description: 'Should resolve with array containing single value',
      createInput: () => [createDelayedPromise('single', 50)]
    },
    {
      name: 'Multiple resolved promises (different timing)',
      input: null,
      description: 'Should preserve order despite different completion times',
      createInput: () => [
        createDelayedPromise('first', 100),
        createDelayedPromise('second', 50),
        createDelayedPromise('third', 150)
      ]
    },
    {
      name: 'Mixed values and promises',
      input: null,
      description: 'Should handle mix of immediate values and promises',
      createInput: () => [
        'immediate value',
        createDelayedPromise('delayed', 50),
        Promise.resolve('resolved'),
        42
      ]
    },
    {
      name: 'Single rejected promise',
      input: null,
      description: 'Should reject immediately when first promise rejects',
      createInput: () => [
        createDelayedPromise('success', 100),
        createRejectedPromise(new Error('Test error'), 50),
        createDelayedPromise('never reached', 200)
      ]
    },
    {
      name: 'First promise rejects',
      input: null,
      description: 'Should reject with first error',
      createInput: () => [
        createRejectedPromise(new Error('First fails'), 10),
        createDelayedPromise('second', 100)
      ]
    },
    {
      name: 'Large array of promises',
      input: null,
      description: 'Should handle large arrays efficiently',
      createInput: () => Array.from({ length: 10 }, (_, i) => 
        createDelayedPromise(`item-${i}`, Math.random() * 100)
      )
    }
  ]

  let passedTests = 0
  let totalTests = tests.length

  for (const test of tests) {
    console.log(`\n📋 Test: ${test.name}`)
    console.log(`   ${test.description}`)
    
    try {
      // Create fresh test input for each test to avoid reusing rejected promises
      const testInput = test.createInput ? test.createInput() : test.input
      console.log(`   🔧 DEBUG: Created input array with ${testInput.length} items`)
      
      const startTime = Date.now()
      
      // Create separate input arrays for each test to avoid cross-contamination
      const nativeInput = test.createInput ? test.createInput() : test.input
      const customInput = test.createInput ? test.createInput() : test.input
      
      console.log(`   🏃 DEBUG: Starting both implementations...`)
      
      // Run both implementations with separate inputs
      const results = await Promise.allSettled([
        Promise.all(nativeInput).catch(err => {
          console.log(`   🔍 DEBUG: Native Promise.all rejected with: ${err.message}`)
          throw err
        }),
        customPromiseAll(customInput).catch(err => {
          console.log(`   🔍 DEBUG: Custom Promise.all rejected with: ${err.message}`)
          throw err
        })
      ])
      
      const [nativeResult, customResult] = results
      const duration = Date.now() - startTime
      
      console.log(`   ⏱️ DEBUG: Both completed in ${duration}ms`)
      console.log(`   📊 DEBUG: Native status: ${nativeResult.status}`)
      console.log(`   📊 DEBUG: Custom status: ${customResult.status}`)
      
      // Compare results
      const nativeSuccess = nativeResult.status === 'fulfilled'
      const customSuccess = customResult.status === 'fulfilled'
      
      if (nativeSuccess !== customSuccess) {
        console.log(`   ❌ FAIL: Resolution status mismatch`)
        console.log(`      Native: ${nativeResult.status}`)
        console.log(`      Custom: ${customResult.status}`)
        if (nativeResult.status === 'rejected') {
          console.log(`      Native error: ${nativeResult.reason.message}`)
        }
        if (customResult.status === 'rejected') {
          console.log(`      Custom error: ${customResult.reason.message}`)
        }
        continue
      }
      
      if (nativeSuccess) {
        // Both resolved - compare values
        const nativeValues = nativeResult.value
        const customValues = customResult.value
        
        console.log(`   🔍 DEBUG: Comparing resolved values...`)
        console.log(`      Native length: ${nativeValues.length}`)
        console.log(`      Custom length: ${customValues.length}`)
        
        if (JSON.stringify(nativeValues) === JSON.stringify(customValues)) {
          console.log(`   ✅ PASS: Results match (${duration}ms)`)
          console.log(`      Result: [${nativeValues.map(v => `"${v}"`).join(', ')}]`)
          passedTests++
        } else {
          console.log(`   ❌ FAIL: Result values mismatch`)
          console.log(`      Native: [${nativeValues.map(v => `"${v}"`).join(', ')}]`)
          console.log(`      Custom: [${customValues.map(v => `"${v}"`).join(', ')}]`)
        }
      } else {
        // Both rejected - compare error types
        const nativeError = nativeResult.reason
        const customError = customResult.reason
        
        console.log(`   🔍 DEBUG: Comparing rejection reasons...`)
        console.log(`      Native error: "${nativeError.message}"`)
        console.log(`      Custom error: "${customError.message}"`)
        
        if (nativeError.message === customError.message) {
          console.log(`   ✅ PASS: Errors match (${duration}ms)`)
          console.log(`      Error: "${nativeError.message}"`)
          passedTests++
        } else {
          console.log(`   ❌ FAIL: Error messages mismatch`)
          console.log(`      Native: "${nativeError.message}"`)
          console.log(`      Custom: "${customError.message}"`)
        }
      }
      
    } catch (error) {
      console.log(`   ❌ FAIL: Test execution error: ${error.message}`)
      console.log(`   🔍 DEBUG: Stack trace:`, error.stack)
    }
    
    // Add a small delay between tests to prevent timing issues
    await new Promise(resolve => setTimeout(resolve, 10))
  }
  
  // Restore original rejection handlers
  process.removeAllListeners('unhandledRejection')
  originalRejectionHandler.forEach(handler => {
    process.on('unhandledRejection', handler)
  })
  
  console.log(`\n🏁 Test Summary: ${passedTests}/${totalTests} tests passed`)
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! Your implementation matches Promise.all behavior.')
  } else {
    console.log('⚠️  Some tests failed. Check the implementation.')
  }
  
  return passedTests === totalTests
}

// Performance comparison test
async function performanceTest(customPromiseAll) {
  console.log('\n⚡ Performance Test...')
  
  try {
    const largeArray = Array.from({ length: 100 }, (_, i) => 
      createDelayedPromise(`item-${i}`, Math.random() * 10)
    )
    
    console.log('   🏃 Running native Promise.all...')
    const nativeStart = Date.now()
    await Promise.all(largeArray)
    const nativeDuration = Date.now() - nativeStart
    
    // Reset promises
    const largeArray2 = Array.from({ length: 100 }, (_, i) => 
      createDelayedPromise(`item-${i}`, Math.random() * 10)
    )
    
    console.log('   🏃 Running custom Promise.all...')
    const customStart = Date.now()
    await customPromiseAll(largeArray2)
    const customDuration = Date.now() - customStart
    
    console.log(`   Native Promise.all: ${nativeDuration}ms`)
    console.log(`   Custom implementation: ${customDuration}ms`)
    console.log(`   Performance ratio: ${(customDuration / nativeDuration).toFixed(2)}x`)
  } catch (error) {
    console.log(`   ❌ Performance test failed: ${error.message}`)
  }
}

// Run the tests
async function runAllTests() {
  try {
    console.log('🚀 Starting test suite...\n')
    
    // Test your custom implementation
    const allTestsPassed = await testPromiseAllImplementation(myPromiseAll)
    
    if (allTestsPassed) {
      await performanceTest(myPromiseAll)
    }
    
    console.log('\n✨ Test suite completed!')
  } catch (error) {
    console.error('💥 Test suite crashed:', error.message)
    console.error('Stack trace:', error.stack)
  }
}

// Export for use in other files
export { testPromiseAllImplementation, performanceTest }

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests()
}