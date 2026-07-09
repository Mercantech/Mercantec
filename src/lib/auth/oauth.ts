import { getAuthConfig, getRedirectUri } from "./config";
import {
  buildAuthorizeUrl,
  randomVerifier,
  sha256Base64Url,
} from "./pkce";
import {
  clearPkceSession,
  clearTokens,
  getPkceVerifier,
  getOAuthState,
  getRefreshToken,
  setPkceSession,
  setTokens,
} from "./storage";

export interface TokenResponse {
  access_token?: string;
  refresh_token?: string;
  token_type?: string;
  expires_in?: number;
  error?: string;
  error_description?: string;
}

async function postToken(body: URLSearchParams): Promise<TokenResponse> {
  const { authBaseUrl } = getAuthConfig();
  const res = await fetch(`${authBaseUrl}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const text = await res.text();
  let json: TokenResponse;
  try {
    json = JSON.parse(text) as TokenResponse;
  } catch {
    throw new Error(`Ugyldigt token-svar (${res.status})`);
  }

  if (!res.ok) {
    const detail = json.error_description ?? json.error ?? text;
    throw new Error(`Token-kald fejlede (${res.status}): ${detail}`);
  }

  return json;
}

export async function startLogin(): Promise<void> {
  const cfg = getAuthConfig();
  const redirectUri = getRedirectUri();
  const verifier = randomVerifier(64);
  const challenge = await sha256Base64Url(verifier);
  const state = randomVerifier(24);

  setPkceSession(verifier, state);

  const url = buildAuthorizeUrl({
    authBaseUrl: cfg.authBaseUrl,
    clientId: cfg.clientId,
    redirectUri,
    state,
    codeChallenge: challenge,
  });

  window.location.assign(url);
}

export async function exchangeCode(code: string, state: string): Promise<TokenResponse> {
  const expectedState = getOAuthState();
  if (!state || state !== expectedState) {
    throw new Error("Ugyldig state — muligt CSRF-forsøg. Prøv at logge ind igen.");
  }

  const verifier = getPkceVerifier();
  if (!verifier) {
    throw new Error("Mangler PKCE verifier i session. Prøv at logge ind igen.");
  }

  const cfg = getAuthConfig();
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: getRedirectUri(),
    client_id: cfg.clientId,
    code_verifier: verifier,
  });

  const tokens = await postToken(body);

  if (!tokens.access_token) {
    throw new Error("Token-svar mangler access_token");
  }

  setTokens(tokens.access_token, tokens.refresh_token);
  clearPkceSession();
  return tokens;
}

export async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  const cfg = getAuthConfig();
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: cfg.clientId,
  });

  try {
    const tokens = await postToken(body);
    if (!tokens.access_token) return null;
    setTokens(tokens.access_token, tokens.refresh_token);
    return tokens.access_token;
  } catch {
    clearTokens();
    return null;
  }
}

export function logout(): void {
  const cfg = getAuthConfig();
  clearTokens();
  const returnUrl = window.location.origin + "/";
  window.location.href = `${cfg.authBaseUrl.replace(/\/$/, "")}/signout?returnUrl=${encodeURIComponent(returnUrl)}`;
}
