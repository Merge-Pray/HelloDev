// Mobile Authentication Testing Script
// Run this in browser console to test mobile auth compatibility

console.log('🧪 Starting Mobile Authentication Tests...');

// Test 1: Browser Detection
function testBrowserDetection() {
  console.log('\n📱 Test 1: Browser Detection');
  
  const userAgent = navigator.userAgent;
  console.log('User Agent:', userAgent);
  
  const isSamsung = /SamsungBrowser/i.test(userAgent);
  const isIOSChrome = /CriOS/i.test(userAgent) && /iPhone|iPad|iPod/i.test(userAgent);
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  
  console.log('Samsung Browser:', isSamsung ? '✅' : '❌');
  console.log('iOS Chrome:', isIOSChrome ? '✅' : '❌');
  console.log('Mobile Browser:', isMobile ? '✅' : '❌');
  
  return { isSamsung, isIOSChrome, isMobile };
}

// Test 2: localStorage Reliability
function testLocalStorageReliability() {
  console.log('\n💾 Test 2: localStorage Reliability');
  
  const testKey = 'mobile-auth-test-' + Date.now();
  const testData = { test: true, timestamp: Date.now(), user: { id: 123, name: 'test' } };
  
  try {
    // Write test
    localStorage.setItem(testKey, JSON.stringify(testData));
    console.log('Write test:', '✅');
    
    // Immediate read test
    const immediate = localStorage.getItem(testKey);
    const immediateSuccess = immediate === JSON.stringify(testData);
    console.log('Immediate read:', immediateSuccess ? '✅' : '❌');
    
    // Delayed read test (Samsung browser issue)
    setTimeout(() => {
      const delayed = localStorage.getItem(testKey);
      const delayedSuccess = delayed === JSON.stringify(testData);
      console.log('Delayed read (100ms):', delayedSuccess ? '✅' : '❌');
      
      // Cleanup
      localStorage.removeItem(testKey);
      
      // Verify cleanup
      setTimeout(() => {
        const afterRemoval = localStorage.getItem(testKey);
        console.log('Cleanup verification:', afterRemoval === null ? '✅' : '❌');
      }, 50);
    }, 100);
    
    return true;
  } catch (error) {
    console.error('localStorage test failed:', error);
    return false;
  }
}

// Test 3: Cookie Support
function testCookieSupport() {
  console.log('\n🍪 Test 3: Cookie Support');
  
  console.log('Cookies enabled:', navigator.cookieEnabled ? '✅' : '❌');
  
  // Test cookie write/read
  const testCookieName = 'mobile-auth-test';
  const testCookieValue = 'test-' + Date.now();
  
  try {
    document.cookie = `${testCookieName}=${testCookieValue}; path=/; max-age=60`;
    
    const cookies = document.cookie.split(';').map(c => c.trim());
    const testCookie = cookies.find(c => c.startsWith(testCookieName));
    
    if (testCookie && testCookie.includes(testCookieValue)) {
      console.log('Cookie write/read:', '✅');
      
      // Cleanup
      document.cookie = `${testCookieName}=; path=/; max-age=0`;
      return true;
    } else {
      console.log('Cookie write/read:', '❌');
      return false;
    }
  } catch (error) {
    console.error('Cookie test failed:', error);
    return false;
  }
}

// Test 4: Network Connectivity
async function testNetworkConnectivity() {
  console.log('\n🌐 Test 4: Network Connectivity');
  
  try {
    const response = await fetch('/api/user/auth-status', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Cache-Control': 'no-cache'
      }
    });
    
    console.log('Auth endpoint reachable:', response.status < 500 ? '✅' : '❌');
    console.log('Response status:', response.status);
    
    return response.status < 500;
  } catch (error) {
    console.error('Network test failed:', error);
    console.log('Auth endpoint reachable:', '❌');
    return false;
  }
}

// Test 5: Session Storage as Fallback
function testSessionStorageFallback() {
  console.log('\n📦 Test 5: Session Storage Fallback');
  
  const testKey = 'session-test-' + Date.now();
  const testData = { fallback: true, timestamp: Date.now() };
  
  try {
    sessionStorage.setItem(testKey, JSON.stringify(testData));
    const retrieved = sessionStorage.getItem(testKey);
    const success = retrieved === JSON.stringify(testData);
    
    console.log('Session storage available:', success ? '✅' : '❌');
    
    // Cleanup
    sessionStorage.removeItem(testKey);
    
    return success;
  } catch (error) {
    console.error('Session storage test failed:', error);
    return false;
  }
}

// Test 6: Zustand Store Compatibility
function testZustandCompatibility() {
  console.log('\n🏪 Test 6: Zustand Store Compatibility');
  
  try {
    // Check if useUserStore is available
    if (typeof useUserStore !== 'undefined') {
      const store = useUserStore.getState();
      console.log('Zustand store accessible:', '✅');
      console.log('Current user in store:', store.currentUser ? '✅' : '❌');
      return true;
    } else {
      console.log('Zustand store accessible:', '❌ (not in scope)');
      return false;
    }
  } catch (error) {
    console.error('Zustand test failed:', error);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('🧪 Mobile Authentication Compatibility Test Suite');
  console.log('================================================');
  
  const results = {
    browserDetection: testBrowserDetection(),
    localStorage: testLocalStorageReliability(),
    cookies: testCookieSupport(),
    network: await testNetworkConnectivity(),
    sessionStorage: testSessionStorageFallback(),
    zustand: testZustandCompatibility()
  };
  
  console.log('\n📊 Test Results Summary:');
  console.log('========================');
  Object.entries(results).forEach(([test, result]) => {
    console.log(`${test}:`, result ? '✅ PASS' : '❌ FAIL');
  });
  
  const passCount = Object.values(results).filter(Boolean).length;
  const totalCount = Object.keys(results).length;
  
  console.log(`\n🎯 Overall Score: ${passCount}/${totalCount} tests passed`);
  
  if (results.browserDetection.isSamsung) {
    console.log('\n🔍 Samsung Browser Detected - Enhanced compatibility mode recommended');
  }
  
  if (results.browserDetection.isIOSChrome) {
    console.log('\n🔍 iOS Chrome Detected - Enhanced compatibility mode recommended');
  }
  
  return results;
}

// Auto-run tests
runAllTests().then(results => {
  console.log('\n✨ Testing complete! Check results above.');
}).catch(error => {
  console.error('❌ Test suite failed:', error);
});

// Export for manual testing
window.mobileAuthTests = {
  runAllTests,
  testBrowserDetection,
  testLocalStorageReliability,
  testCookieSupport,
  testNetworkConnectivity,
  testSessionStorageFallback,
  testZustandCompatibility
};