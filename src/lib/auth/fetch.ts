import { refreshAccessToken } from "./oauth";
import { getAccessToken } from "./storage";

export interface MercantecFetchInit extends RequestInit {
  skipAuth?: boolean;
}

/**
 * Fetch-wrapper der sætter Authorization: Bearer og prøver refresh én gang ved 401.
 */
export async function mercantecFetch(
  input: RequestInfo | URL,
  init: MercantecFetchInit = {},
): Promise<Response> {
  const { skipAuth, headers: initHeaders, ...rest } = init;
  const headers = new Headers(initHeaders);

  if (!skipAuth) {
    const token = getAccessToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  let response = await fetch(input, { ...rest, headers });

  if (!skipAuth && (response.status === 401 || response.status === 403)) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers.set("Authorization", `Bearer ${newToken}`);
      response = await fetch(input, { ...rest, headers });
    }
  }

  return response;
}
