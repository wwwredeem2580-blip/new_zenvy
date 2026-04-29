import { Request, Response } from 'express';
import { handleError } from '../../utils/handleError';
import * as applicationService from './service';
import { CreateApplicationSchema } from './schema';

export const create = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId;
    const parsed = CreateApplicationSchema.parse(req.body);
    const application = await applicationService.submitApplication(userId, parsed);
    res.status(201).json({ success: true, application });
  } catch (error) {
    handleError(error, res);
  }
};

export const getMyApplications = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId;
    const applications = await applicationService.getUserApplications(userId);
    res.status(200).json({ success: true, applications });
  } catch (error) {
    handleError(error, res);
  }
};

export const getDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.userId;
    const role = (req as any).user.role;
    const application = await applicationService.getApplicationById(userId, role, id as string);
    res.status(200).json({ success: true, application });
  } catch (error) {
    handleError(error, res);
  }
};

export const listAll = async (_req: Request, res: Response): Promise<void> => {
  try {
    const applications = await applicationService.getAllApplications();
    res.status(200).json({ success: true, applications });
  } catch (error) {
    handleError(error, res);
  }
};

export const getUploadUrl = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId;
    const { filename, contentType } = req.body;
    const result = await applicationService.getSignedUploadUrl(userId, filename, contentType);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    handleError(error, res);
  }
};

export const getAttachmentPreviewUrl = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId;
    const role = (req as any).user.role;
    const { id, attachmentKey } = req.params; // application ID (CAF-XXX) and objectKey
    
    // The attachmentKey might be encoded if it contains slashes, but express usually handles it
    // However, if the user sends the full key, we might need to handle it.
    
    const previewUrl = await applicationService.getSignedPreviewUrl(userId, role, id as string, attachmentKey as string);
    res.status(200).json({ success: true, previewUrl });
  } catch (error) {
    handleError(error, res);
  }
};
