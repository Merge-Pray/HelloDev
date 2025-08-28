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

<<<<<<< HEAD
    console.log('API_URL:', API_URL);
    console.log('endpoint:', endpoint);
    console.log('final URL:', url);

    // Automatisch Content-Type erkennen und nur bei JSON setzen
    const headers = { ...options.headers };
    
    // Content-Type nur bei JSON-Body setzen, nicht bei FormData
    if (!options.body || typeof options.body === 'string' || options.body.constructor === Object) {
      headers["Content-Type"] = "application/json";
    }
    // Bei FormData wird Content-Type automatisch vom Browser gesetzt
=======
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (isSamsungInternet()) {
      headers["Cache-Control"] = "no-cache";
      headers["Pragma"] = "no-cache";
    }
>>>>>>> origin

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
