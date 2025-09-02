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

export const getUniversalCookieOptions = (baseOptions = {}, req = null) => {
  const userAgent = req?.headers?.['user-agent'] || '';
  const isMobileBrowser = /Mobile|Android|iPhone|iPad|iPod/i.test(userAgent);
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isMobileBrowser && !isProduction) {
    // For mobile browsers in development: use lax instead of none
    return {
      ...baseOptions,
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    };
  }
  
  // Use Pollio's proven working configuration for desktop/production
  return {
    ...baseOptions,
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 24 * 60 * 60 * 1000,
  };
};
