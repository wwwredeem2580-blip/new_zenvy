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

export const listAll = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId;
    const role = (req as any).user.role;
    const applications = await applicationService.getAllApplications(role, userId);
    res.status(200).json({ success: true, applications });
  } catch (error) {
    handleError(error, res);
  }
};

export const upload = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId;
    const file = req.file as Express.Multer.File;
    if (!file) throw new Error('No file uploaded');

    const result = await applicationService.uploadAttachment(userId, file);
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
export const updatePaymentStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const actor = {
      name: `${(req as any).user.firstName} ${(req as any).user.lastName}`,
      id: (req as any).user.userId,
    };

    const application = await applicationService.updatePaymentStatus(id as string, status, actor);
    res.status(200).json({ success: true, application });
  } catch (error) {
    handleError(error, res);
  }
};

export const assignAgent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { agentId } = req.body;
    const actor = {
      name: `${(req as any).user.firstName} ${(req as any).user.lastName}`,
      id: (req as any).user.userId,
    };

    const application = await applicationService.assignApplication(id as string, agentId, actor);
    res.status(200).json({ success: true, application });
  } catch (error) {
    handleError(error, res);
  }
};

export const updateStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const actor = {
      name: `${(req as any).user.firstName} ${(req as any).user.lastName}`,
      id: (req as any).user.userId,
    };

    const application = await applicationService.updateStatus(id as string, status, actor);
    res.status(200).json({ success: true, application });
  } catch (error) {
    handleError(error, res);
  }
};

export const unassignAgent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const actor = {
      name: `${(req as any).user.firstName} ${(req as any).user.lastName}`,
      id: (req as any).user.userId,
    };

    const application = await applicationService.unassignApplication(id as string, actor);
    res.status(200).json({ success: true, application });
  } catch (error) {
    handleError(error, res);
  }
};

export const addNote = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const note = {
      text,
      authorId: (req as any).user.userId,
      authorName: `${(req as any).user.firstName} ${(req as any).user.lastName}`,
    };

    const application = await applicationService.addNote(id as string, note);
    res.status(200).json({ success: true, application });
  } catch (error) {
    handleError(error, res);
  }
};

export const addAttachment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.userId;
    const uploaderName = `${(req as any).user.firstName} ${(req as any).user.lastName}`;
    const file = req.file as Express.Multer.File;
    if (!file) throw new Error('No file uploaded');

    const application = await applicationService.addAttachment(id as string, userId, file, uploaderName);
    res.status(200).json({ success: true, application });
  } catch (error) {
    handleError(error, res);
  }
};
