const isProduction = process.env.NODE_ENV === 'production';

const BASE_COOKIE_CONFIG = {
  httpOnly: true,
  secure: isProduction,
  sameSite: 'lax' as const,
  domain: isProduction ? (process.env.COOKIE_DOMAIN || undefined) : undefined,
};

// Access token cookie — 7 days, matches JWT expiry
export const ACCESS_TOKEN_CONFIG = {
  ...BASE_COOKIE_CONFIG,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};