export const isSamsungBrowser = (userAgent) => {
  if (!userAgent) return false;
  
  // Samsung Internet browser identification patterns
  const samsungPatterns = [
    /SamsungBrowser/i,
    /Samsung.*Browser/i,
    // Some versions use different patterns
    /SAMSUNG.*SM-/i
  ];
  
  return samsungPatterns.some(pattern => pattern.test(userAgent));
};

export const isIOSChrome = (userAgent) => {
  if (!userAgent) return false;
  
  // iOS Chrome detection
  return /CriOS/i.test(userAgent) && /iPhone|iPad|iPod/i.test(userAgent);
};

export const isMobileBrowser = (userAgent) => {
  if (!userAgent) return false;
  
  return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
};

export const getEnhancedCookieOptions = (userAgent, baseOptions = {}) => {
  const isSamsung = isSamsungBrowser(userAgent);
  const isIOSChr = isIOSChrome(userAgent);
  const isMobile = isMobileBrowser(userAgent);
  
  // Base options
  let cookieOptions = {
    ...baseOptions,
    httpOnly: true,
    path: '/',
  };

  // Samsung Browser specific settings
  if (isSamsung) {
    cookieOptions = {
      ...cookieOptions,
      secure: false,  // Samsung has issues with secure cookies
      sameSite: 'lax', // Samsung doesn't handle 'none' well
      domain: undefined, // Don't set domain for Samsung
    };
  }
  // iOS Chrome specific settings
  else if (isIOSChr) {
    cookieOptions = {
      ...cookieOptions,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // iOS Chrome has issues with 'none'
      domain: undefined, // Don't set domain for iOS Chrome
    };
  }
  // Other mobile browsers
  else if (isMobile) {
    cookieOptions = {
      ...cookieOptions,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // More compatible for mobile
    };
  }
  // Desktop browsers
  else {
    cookieOptions = {
      ...cookieOptions,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    };
  }

  return cookieOptions;
};

export const logBrowserInfo = (userAgent, req) => {
  const isSamsung = isSamsungBrowser(userAgent);
  const isIOSChr = isIOSChrome(userAgent);
  const isMobile = isMobileBrowser(userAgent);
  
  if (isSamsung || isIOSChr) {
    console.log(`🔍 Special browser detected:`, {
      type: isSamsung ? 'Samsung' : 'iOS Chrome',
      userAgent: userAgent?.substring(0, 100) + '...',
      ip: req.ip || req.connection?.remoteAddress,
      timestamp: new Date().toISOString()
    });
  }
};