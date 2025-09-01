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

export const getSamsungCompatibleCookieOptions = (userAgent, baseOptions = {}) => {
  const isSamsung = isSamsungBrowser(userAgent);
  
  if (isSamsung) {
    // Samsung browser compatible settings
    return {
      ...baseOptions,
      secure: false,  // Samsung has issues with secure cookies in some cases
      sameSite: 'lax' // Samsung doesn't handle 'none' well
    };
  }
  
  // Default production settings
  return {
    ...baseOptions,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  };
};
