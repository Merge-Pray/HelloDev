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
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (isSamsungInternet()) {
      headers["Cache-Control"] = "no-cache";
      headers["Pragma"] = "no-cache";
    }

    return await fetch(url, {
      credentials: "include",
      headers,
      ...options,
    });
  };

  let response = await makeRequest();

  if (isAuthError(response)) {
    response = await handleAuthErrorAndRetry(makeRequest);
  }

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  const data = await response.json();
  return data;
};
