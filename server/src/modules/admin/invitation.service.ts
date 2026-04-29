import { Invitation, IInvitation } from '../../models/Invitation.model';
import { User } from '../../models/User.model';
import CustomError from '../../utils/CustomError';
import crypto from 'crypto';
import { addEmailJob } from '../../workers/email.queue';
import { invitationTemplate } from '../../utils/email/invitation';
import mongoose from 'mongoose';

/**
 * createInvitation - Generates a secure token, saves the invite, and sends an email.
 */
export const createInvitation = async (data: { email: string; role: 'agent' | 'admin'; invitedBy: string; adminName: string }) => {
  const { email, role, invitedBy, adminName } = data;

  // 1. Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) throw new CustomError('User with this email already exists', 400);

  // 2. Check for existing pending invitation
  const existingInvite = await Invitation.findOne({ email, status: 'Pending' });
  if (existingInvite) {
    // If it exists, we could either resend or throw error. Let's resend by updating it.
    existingInvite.token = crypto.randomBytes(32).toString('hex');
    existingInvite.expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48h
    await existingInvite.save();
    
    // Enqueue email
    await addEmailJob('INVITATION', {
      email,
      html: invitationTemplate({ email, role, token: existingInvite.token, adminName }),
    });

    return existingInvite;
  }

  // 3. Create new invitation
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48h

  const invitation = await Invitation.create({
    email,
    role,
    token,
    expiresAt,
    invitedBy: new mongoose.Types.ObjectId(invitedBy),
  });

  // 4. Enqueue email
  await addEmailJob('INVITATION', {
    email,
    html: invitationTemplate({ email, role, token, adminName }),
  });

  return invitation;
};

/**
 * listInvitations - Retrieves all invitations.
 */
export const listInvitations = async () => {
  return Invitation.find().sort({ createdAt: -1 });
};

/**
 * revokeInvitation - Cancels an invitation.
 */
export const revokeInvitation = async (id: string) => {
  const invitation = await Invitation.findById(id);
  if (!invitation) throw new CustomError('Invitation not found', 404);
  
  await Invitation.findByIdAndDelete(id);
  return { success: true };
};

/**
 * verifyInvitation - Checks if a token is valid.
 */
export const verifyInvitation = async (token: string) => {
  const invitation = await Invitation.findOne({ token, status: 'Pending' });
  
  if (!invitation) throw new CustomError('Invalid or expired invitation token', 400);
  
  if (invitation.expiresAt < new Date()) {
    invitation.status = 'Expired';
    await invitation.save();
    throw new CustomError('Invitation has expired', 400);
  }

  return invitation;
};
