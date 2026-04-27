import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { User } from '../../models/User.model';
import { generateAccessToken } from '../../utils/auth/token';
import { GoogleClient } from '../../utils/auth/google';
import { addEmailJob } from '../../workers/email.queue';
import CustomError from '../../utils/CustomError';
import { RegisterInput, LoginInput } from './schema';

// ─── Manual Registration ──────────────────────────────────────────────────────
export const registerManual = async (data: RegisterInput) => {
  const { firstName, lastName, email, password } = data;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new CustomError('An account with this email already exists', 409);
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Generate verification token (hex, 64 chars)
  const verificationToken = crypto.randomBytes(32).toString('hex');
  const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  const user = await User.create({
    firstName,
    lastName,
    email,
    password: hashedPassword,
    role: 'client',
    authProvider: 'manual',
    isEmailVerified: false,
    emailVerificationToken: verificationToken,
    emailVerificationTokenExpiry: tokenExpiry,
  });

  // Queue verification email
  const verificationLink = `${process.env.SERVER_URL}/auth/verify-email?token=${verificationToken}`;
  await addEmailJob('EMAIL_VERIFICATION', {
    email,
    name: `${firstName} ${lastName}`,
    verificationLink,
  });

  return {
    message: 'Account created. Please check your email to verify your account.',
    userId: user._id,
  };
};

// ─── Email Verification ───────────────────────────────────────────────────────
export const verifyEmail = async (token: string) => {
  if (!token) throw new CustomError('Verification token is required', 400);

  // Must explicitly select the hidden fields
  const user = await User.findOne({ emailVerificationToken: token })
    .select('+emailVerificationToken +emailVerificationTokenExpiry');

  if (!user) {
    throw new CustomError('Invalid or expired verification link', 400);
  }

  if (!user.emailVerificationTokenExpiry || user.emailVerificationTokenExpiry < new Date()) {
    throw new CustomError('Verification link has expired. Please request a new one.', 400);
  }

  // Activate account
  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationTokenExpiry = undefined;
  await user.save();

  // Queue welcome email
  await addEmailJob('WELCOME_CLIENT', {
    email: user.email,
    name: `${user.firstName} ${user.lastName}`,
    portalUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  });

  return { message: 'Email verified successfully. You can now log in.' };
};

// ─── Manual Login ─────────────────────────────────────────────────────────────
export const loginManual = async (data: LoginInput) => {
  const { email, password } = data;

  // Explicitly include password (it's select: false on model)
  const user = await User.findOne({ email }).select('+password');

  if (!user || user.authProvider !== 'manual') {
    throw new CustomError('Invalid email or password', 401);
  }

  if (!user.password) {
    throw new CustomError('Invalid email or password', 401);
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    throw new CustomError('Invalid email or password', 401);
  }

  if (!user.isEmailVerified) {
    throw new CustomError(
      'Please verify your email before logging in. Check your inbox for the verification link.',
      403
    );
  }

  const token = generateAccessToken({
    userId: user._id.toString(),
    role: user.role,
    email: user.email,
  });

  return {
    token,
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    },
  };
};

// ─── Google OAuth — Get Auth URL ──────────────────────────────────────────────
export const getGoogleAuthUrl = (): string => {
  return GoogleClient.generateAuthUrl({
    access_type: 'online', // No refresh token needed
    prompt: 'select_account',
    scope: [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
      'openid',
    ],
  });
};

// ─── Google OAuth — Handle Callback ──────────────────────────────────────────
export const handleGoogleCallback = async (code: string) => {
  if (!code) throw new CustomError('Authorization code is missing', 400);

  // Exchange code for tokens
  const { tokens } = await GoogleClient.getToken(code);
  GoogleClient.setCredentials(tokens);

  // Decode id_token to get user info (no extra request needed)
  const idToken = tokens.id_token;
  if (!idToken) throw new CustomError('Failed to retrieve Google identity token', 500);

  const ticket = await GoogleClient.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_OAUTH_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  if (!payload || !payload.email) {
    throw new CustomError('Failed to retrieve user info from Google', 500);
  }

  const { sub: googleId, email, given_name, family_name, picture } = payload;

  // Upsert user — create if not exists, update Google fields if returning
  let user = await User.findOne({ email });

  if (user) {
    // Existing user — link Google if not already linked
    if (user.authProvider === 'manual' && !user.googleId) {
      user.googleId = googleId;
      user.isEmailVerified = true; // Google users are inherently verified
      if (picture && !user.avatar) user.avatar = picture;
      await user.save();
    }
  } else {
    // New user via Google
    user = await User.create({
      firstName: given_name || 'User',
      lastName: family_name || '',
      email,
      role: 'client',
      authProvider: 'google',
      isEmailVerified: true, // Google-authenticated — no email verification needed
      googleId,
      avatar: picture || undefined,
    });
  }

  const token = generateAccessToken({
    userId: user._id.toString(),
    role: user.role,
    email: user.email,
  });

  return {
    token,
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    },
  };
};
