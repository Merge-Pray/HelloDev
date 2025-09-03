import { API_URL } from "../lib/config";
import { handleAuthErrorAndRetry, isAuthError } from "./tokenRefresh";

export const authenticatedFetch = async (endpoint, options = {}) => {
  const makeRequest = async () => {
    const url = endpoint.startsWith("http")
      ? endpoint
      : `${API_URL}${endpoint}`;

    const headers = {
      ...options.headers,
    };

    if (!options.body || !(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    return await fetch(url, {
      credentials: "include",
      headers,
      ...options,
    });
  };

  let response = await makeRequest();

  // TEMPORARY TEST: Disable retry logic to match Pollio's simple fetch approach
  // if (isAuthError(response)) {
  //   response = await handleAuthErrorAndRetry(makeRequest);
  // }

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error("Access forbidden");
    }
    if (response.status >= 500) {
      throw new Error("Server error - please try again later");
    }
    throw new Error(`Request failed: ${response.status}`);
  }

  const data = await response.json();
  return data;
};
