// Samsung Browser Network Fix
// Samsung browsers have specific issues with fetch requests

import { isSamsungInternet } from "./samsungBrowserDebug";

// Samsung-compatible fetch wrapper
export const samsungCompatibleFetch = async (url, options = {}) => {
  if (!isSamsungInternet()) {
    // Use normal fetch for non-Samsung browsers
    return fetch(url, options);
  }

  console.log('🔍 Samsung Browser - Using compatible fetch for:', url);

  // Samsung Browser specific fixes
  const samsungOptions = {
    ...options,
    // Remove problematic options for Samsung
    cache: 'no-cache',
    // Ensure credentials are properly set
    credentials: options.credentials || 'include',
    // Use simpler headers
    headers: {
      ...options.headers,
      // Remove any headers that might cause issues
    },
    // Add longer timeout for Samsung
    signal: options.signal || AbortSignal.timeout(15000)
  };

  // Remove undefined values that Samsung doesn't like
  Object.keys(samsungOptions).forEach(key => {
    if (samsungOptions[key] === undefined) {
      delete samsungOptions[key];
    }
  });

  try {
    console.log('🔍 Samsung Browser - Fetch options:', samsungOptions);
    
    // Try the request
    const response = await fetch(url, samsungOptions);
    
    console.log('🔍 Samsung Browser - Response status:', response.status);
    console.log('🔍 Samsung Browser - Response ok:', response.ok);
    
    return response;
  } catch (error) {
    console.error('🔍 Samsung Browser - Fetch failed:', error);
    
    // Try a fallback approach for Samsung
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      console.log('🔍 Samsung Browser - Trying fallback fetch...');
      
      // Ultra-simple fallback for Samsung
      const fallbackOptions = {
        method: options.method || 'GET',
        credentials: 'include'
      };
      
      // Only add body if it's not a GET request
      if (options.method && options.method !== 'GET' && options.body) {
        fallbackOptions.body = options.body;
        fallbackOptions.headers = {
          'Content-Type': 'application/json'
        };
      }
      
      return fetch(url, fallbackOptions);
    }
    
    throw error;
  }
};

// Samsung-compatible login function
export const samsungCompatibleLogin = async (loginData, apiUrl) => {
  const url = `${apiUrl}/api/user/login`;
  
  console.log('🔍 Samsung Browser - Starting compatible login to:', url);
  console.log('🔍 Samsung Browser - API_URL value:', apiUrl);
  console.log('🔍 Samsung Browser - Full login URL:', url);
  
  try {
    // First, try a simple connectivity test
    const testResponse = await samsungCompatibleFetch(`${apiUrl}/`, {
      method: 'GET'
    });
    
    console.log('🔍 Samsung Browser - Connectivity test:', testResponse.ok ? 'SUCCESS' : 'FAILED');
    
    if (!testResponse.ok) {
      throw new Error('Cannot connect to server');
    }
    
    // Now try the actual login
    const response = await samsungCompatibleFetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Browser-Type': 'Samsung',
        'X-User-Agent': navigator.userAgent
      },
      body: JSON.stringify(loginData),
      credentials: 'include'
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('🔍 Samsung Browser - Login failed:', response.status, errorText);
      throw new Error(`Login failed: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('🔍 Samsung Browser - Login successful');
    
    return data;
    
  } catch (error) {
    console.error('🔍 Samsung Browser - Login error:', error);
    
    // Provide more specific error messages for Samsung users
    if (error.message.includes('Failed to fetch') || error.message.includes('Network request failed')) {
      throw new Error('Samsung Browser network issue. Try: 1) Disable "Block cross-site tracking" 2) Clear browser data 3) Try "Desktop site" mode');
    }
    
    throw error;
  }
};

// Test Samsung browser connectivity
export const testSamsungConnectivity = async (apiUrl) => {
  if (!isSamsungInternet()) {
    return { success: true, message: 'Not Samsung browser' };
  }
  
  console.log('🔍 Samsung Browser - Testing connectivity...');
  
  console.log('🔍 Samsung Browser - Testing with API_URL:', apiUrl);
  
  const tests = [
    {
      name: 'Basic GET',
      url: `${apiUrl}/`,
      test: () => samsungCompatibleFetch(`${apiUrl}/`)
    },
    {
      name: 'CORS preflight',
      url: `${apiUrl}/api/user/auth-status`,
      test: () => samsungCompatibleFetch(`${apiUrl}/api/user/auth-status`, {
        method: 'GET',
        credentials: 'include'
      })
    },
    {
      name: 'POST with JSON',
      url: `${apiUrl}/api/user/login`,
      test: () => samsungCompatibleFetch(`${apiUrl}/api/user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: 'test', password: 'test' }),
        credentials: 'include'
      })
    }
  ];
  
  const results = [];
  
  for (const test of tests) {
    try {
      console.log(`🔍 Samsung Browser - Testing ${test.name} at: ${test.url}`);
      const response = await test.test();
      results.push({
        name: test.name,
        url: test.url,
        success: true,
        status: response.status
      });
      console.log(`🔍 Samsung Browser - ${test.name}: ✅ ${response.status}`);
    } catch (error) {
      results.push({
        name: test.name,
        url: test.url,
        success: false,
        error: error.message
      });
      console.log(`🔍 Samsung Browser - ${test.name}: ❌ ${error.message}`);
    }
  }
  
  const successCount = results.filter(r => r.success).length;
  
  return {
    success: successCount > 0,
    results,
    message: `${successCount}/${tests.length} tests passed`
  };
};