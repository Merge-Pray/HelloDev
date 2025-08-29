// Samsung Browser debugging utility
// Use this to diagnose issues in Samsung Internet Browser

export const isSamsungInternet = () => {
  return typeof navigator !== 'undefined' && /SamsungBrowser/i.test(navigator.userAgent);
};

export const getSamsungBrowserInfo = () => {
  if (!isSamsungInternet()) {
    return { isSamsung: false };
  }

  const userAgent = navigator.userAgent;
  const samsungMatch = userAgent.match(/SamsungBrowser\/(\d+\.\d+)/);
  const version = samsungMatch ? samsungMatch[1] : 'unknown';

  return {
    isSamsung: true,
    version,
    userAgent,
    supportedFeatures: {
      localStorage: typeof localStorage !== 'undefined',
      sessionStorage: typeof sessionStorage !== 'undefined',
      cookies: navigator.cookieEnabled,
      fetch: typeof fetch !== 'undefined',
    }
  };
};

export const testLocalStorageReliability = () => {
  if (!isSamsungInternet()) {
    console.log('Not Samsung Browser - localStorage should work normally');
    return true;
  }

  console.log('🔍 Testing localStorage reliability in Samsung Browser...');
  
  try {
    const testKey = 'samsung-test-' + Date.now();
    const testValue = { test: true, timestamp: Date.now() };
    const testValueString = JSON.stringify(testValue);

    // Test write
    localStorage.setItem(testKey, testValueString);
    
    // Immediate read
    const immediate = localStorage.getItem(testKey);
    console.log('Immediate read:', immediate === testValueString ? '✅' : '❌');

    // Delayed read (Samsung Browser issue)
    setTimeout(() => {
      const delayed = localStorage.getItem(testKey);
      console.log('Delayed read (50ms):', delayed === testValueString ? '✅' : '❌');
      
      // Cleanup
      localStorage.removeItem(testKey);
      
      // Verify removal
      setTimeout(() => {
        const afterRemoval = localStorage.getItem(testKey);
        console.log('After removal:', afterRemoval === null ? '✅' : '❌');
      }, 50);
    }, 50);

    return true;
  } catch (error) {
    console.error('❌ localStorage test failed:', error);
    return false;
  }
};

export const debugLoginIssue = (userData) => {
  if (!isSamsungInternet()) {
    console.log('Not Samsung Browser - no special debugging needed');
    return;
  }

  console.log('🐛 Samsung Browser Login Debug');
  console.log('Browser info:', getSamsungBrowserInfo());
  console.log('User data received:', userData ? '✅' : '❌');
  
  if (userData) {
    console.log('User data structure:', {
      hasId: !!userData._id,
      hasUsername: !!userData.username,
      hasEmail: !!userData.email,
      fieldCount: Object.keys(userData).length
    });
  }

  // Check localStorage state
  const userStorage = localStorage.getItem('user-storage');
  console.log('localStorage state:', userStorage ? '✅ Exists' : '❌ Missing');
  
  if (userStorage) {
    try {
      const parsed = JSON.parse(userStorage);
      console.log('Parsed data structure:', {
        hasState: !!parsed.state,
        hasCurrentUser: !!parsed.state?.currentUser,
        userId: parsed.state?.currentUser?._id
      });
    } catch (error) {
      console.error('❌ Failed to parse localStorage data:', error);
    }
  }

  // Test localStorage reliability
  testLocalStorageReliability();
};
