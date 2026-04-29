import { Request, Response } from 'express';
import * as invitationService from './invitation.service';
import { handleError } from '../../utils/handleError';

export const createInvitation = async (req: Request, res: Response) => {
  try {
    const admin = (req as any).user;
    const adminName = `${admin.firstName} ${admin.lastName}`;
    
    const invitation = await invitationService.createInvitation({
      ...req.body,
      invitedBy: admin._id,
      adminName,
    });
    
    res.status(201).json({ success: true, invitation });
  } catch (error) {
    handleError(error, res);
  }
};

export const listInvitations = async (_req: Request, res: Response) => {
  try {
    const invitations = await invitationService.listInvitations();
    res.json({ success: true, invitations });
  } catch (error) {
    handleError(error, res);
  }
};

export const revokeInvitation = async (req: Request, res: Response) => {
  try {
    await invitationService.revokeInvitation(req.params.id as string);
    res.json({ success: true, message: 'Invitation revoked' });
  } catch (error) {
    handleError(error, res);
  }
};
