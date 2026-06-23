// Shared auth helpers for the cookie-based viewer gate.
//
// The dashboard is protected by a single shared password (VIEWER_PASSWORD).
// Instead of HTTP Basic auth (which forces the browser's username+password
// popup), we use a password-only login page that sets an httpOnly cookie. The
// cookie stores a SHA-256 of the password so the raw secret is never persisted
// in the browser. Web Crypto is available in both the edge middleware and the
// Node API route, so the same helper works on both sides.

export const AUTH_COOKIE = 'fb_auth';

// 30 days; viewers stay signed in across visits.
export const AUTH_MAX_AGE = 60 * 60 * 24 * 30;

export async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
