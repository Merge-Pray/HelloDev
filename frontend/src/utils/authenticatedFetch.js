import { API_URL } from "../lib/config";
import { handleAuthErrorAndRetry, isAuthError } from "./tokenRefresh";

export const authenticatedFetch = async (endpoint, options = {}) => {
  const makeRequest = async () => {
    const url = endpoint.startsWith("http")
      ? endpoint
      : `${API_URL}${endpoint}`;

    return await fetch(url, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
        ...options.headers,
      },
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
