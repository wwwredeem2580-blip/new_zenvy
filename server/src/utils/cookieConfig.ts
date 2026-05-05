import { Request } from 'express';

/**
 * Returns cookie options for the current request.
 * `secure` is derived from whether the *original* request used HTTPS
 * (Express checks X-Forwarded-Proto when trust proxy is enabled).
 * This handles Hostinger's SSL termination correctly — nginx receives
 * plain HTTP, but forwards X-Forwarded-Proto: https from the original
 * browser connection.
 */
const getCookieConfig = (req: Request) => {
  const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https';

  return {
    httpOnly: true,
    secure: isSecure,
    sameSite: 'lax' as const,
    // Don't set domain — let the browser infer it from the response host.
    // Setting an explicit domain can break subdomain isolation.
  };
};

// Access token cookie — 7 days, matches JWT expiry
export const getAccessTokenConfig = (req: Request) => ({
  ...getCookieConfig(req),
  maxAge: 7 * 24 * 60 * 60 * 1000,
});