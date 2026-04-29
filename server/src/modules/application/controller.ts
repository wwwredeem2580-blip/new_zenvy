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
    const { id } = req.params;
    const { key } = req.query; // application ID (CAF-XXX) and objectKey
    
    const previewUrl = await applicationService.getSignedPreviewUrl(userId, role, id as string, key as string);
    res.status(200).json({ success: true, previewUrl });
  } catch (error) {
    handleError(error, res);
  }
};
