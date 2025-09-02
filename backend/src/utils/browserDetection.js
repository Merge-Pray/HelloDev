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

export const getUniversalCookieOptions = (baseOptions = {}) => {
  // Use Pollio's proven working configuration for ALL browsers
  return {
    ...baseOptions,
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 24 * 60 * 60 * 1000,
  };
};
