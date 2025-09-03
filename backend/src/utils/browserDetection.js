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

export const isIOSBrowser = (userAgent) => {
  if (!userAgent) return false;
  return /iPhone|iPad|iPod/i.test(userAgent);
};

export const getUniversalCookieOptions = (baseOptions = {}, userAgent = '') => {
  // Check if it's a problematic browser
  const isProblematicBrowser = /SamsungBrowser|CriOS/i.test(userAgent);
  
  if (/CriOS/i.test(userAgent)) {
    console.log(`🍪 [COOKIE] Using iOS Chrome-friendly settings`);
    // Use settings similar to working test cookie for iOS Chrome
    return {
      ...baseOptions,
      httpOnly: false, // Same as test cookie that works
      secure: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000,
    };
  }
  
  // Use Pollio's exact working configuration for other browsers
  console.log(`🍪 [COOKIE] Using Pollio's exact configuration`);
  return {
    ...baseOptions,
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 24 * 60 * 60 * 1000,
  };
  
  // Use Pollio's proven working configuration for other browsers
  return {
    ...baseOptions,
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 24 * 60 * 60 * 1000,
  };
};
