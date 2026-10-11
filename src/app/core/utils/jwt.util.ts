export interface JwtPayload {
  exp?: number;
  sub?: string;
  email?: string;
  [key: string]: unknown;
}

export function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const json = decodeURIComponent(
      atob(padded)
        .split('')
        .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`)
        .join(''),
    );

    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

/** Returns true when the JWT is well-formed and not expired. */
export function isJwtValid(token: string | null | undefined, expiresAt?: string | null): boolean {
  if (!token) return false;

  const payload = decodeJwtPayload(token);
  if (payload?.exp != null) {
    // Small skew so we don't send a token that expires mid-flight.
    return payload.exp * 1000 > Date.now() + 5_000;
  }

  if (expiresAt) {
    const expiresMs = Date.parse(expiresAt);
    return !Number.isNaN(expiresMs) && expiresMs > Date.now() + 5_000;
  }

  return false;
}
