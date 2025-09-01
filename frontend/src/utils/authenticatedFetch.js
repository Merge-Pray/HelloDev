import { API_URL } from "../lib/config";
import { handleAuthErrorAndRetry, isAuthError } from "./tokenRefresh";

const isSamsungInternet = () => {
  return /SamsungBrowser/i.test(navigator.userAgent);
};

export const authenticatedFetch = async (endpoint, options = {}) => {
  const makeRequest = async () => {
    const url = endpoint.startsWith("http")
      ? endpoint
      : `${API_URL}${endpoint}`;

    const headers = {
      ...options.headers,
    };

    // Content-Type nur bei JSON setzen, nicht bei FormData
    if (!options.body || !(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    if (isSamsungInternet()) {
      headers["Cache-Control"] = "no-cache";
      headers["Pragma"] = "no-cache";
    }

    // Use 'same-origin' credentials for Samsung Internet browser
    const credentials = isSamsungInternet() ? "same-origin" : "include";
    
    return await fetch(url, {
      credentials,
      headers,
      ...options,
    });
  };

  let response = await makeRequest();

  if (isAuthError(response)) {
    response = await handleAuthErrorAndRetry(makeRequest);
  }

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error('Access forbidden');
    }
    if (response.status >= 500) {
      throw new Error('Server error - please try again later');
    }
    throw new Error(`Request failed: ${response.status}`);
  }

  const data = await response.json();
  return data;
};
