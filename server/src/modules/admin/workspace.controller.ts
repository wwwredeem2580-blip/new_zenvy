import { Request, Response } from 'express';
import * as workspaceService from './workspace.service';
import { handleError } from '../../utils/handleError';

export const listWorkspaces = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const workspaces = await workspaceService.listWorkspaces(user);
    res.json({ success: true, workspaces });
  } catch (error) {
    handleError(error, res);
  }
};

export const createWorkspace = async (req: Request, res: Response) => {
  try {
    const workspace = await workspaceService.createWorkspace(req.body);
    res.status(201).json({ success: true, workspace });
  } catch (error) {
    handleError(error, res);
  }
};

export const updateWorkspace = async (req: Request, res: Response) => {
  try {
    const workspace = await workspaceService.updateWorkspace(req.params.id as string, req.body);
    res.json({ success: true, workspace });
  } catch (error) {
    handleError(error, res);
  }
};

export const deleteWorkspace = async (req: Request, res: Response) => {
  try {
    await workspaceService.deleteWorkspace(req.params.id as string);
    res.json({ success: true, message: 'Workspace deleted' });
  } catch (error) {
    handleError(error, res);
  }
};

export const listFilesInWorkspace = async (req: Request, res: Response) => {
  try {
    const files = await workspaceService.listFilesInWorkspace(req.params.id as string);
    res.json({ success: true, files });
  } catch (error) {
    handleError(error, res);
  }
};

export const uploadFile = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    const user = (req as any).user;
    const actorName = user?.firstName + ' ' + user?.lastName;
    const file = await workspaceService.uploadFileToWorkspace(req.params.id as string, req.file, actorName, user);
    res.json({ success: true, file });
  } catch (error) {
    handleError(error, res);
  }
};

export const getPreviewUrl = async (req: Request, res: Response) => {
  try {
    const { fileKey } = req.query;
    if (!fileKey) {
      return res.status(400).json({ success: false, message: 'fileKey is required' });
    }
    const result = await workspaceService.getFilePreviewUrl(req.params.id as string, fileKey as string);
    res.json({ success: true, ...result });
  } catch (error) {
    handleError(error, res);
  }
};

export const deleteFile = async (req: Request, res: Response) => {
  try {
    // Note: fileKey might contain slashes, so it might need careful routing or query params
    const { fileKey } = req.query;
    if (!fileKey) {
      return res.status(400).json({ success: false, message: 'fileKey is required' });
    }
    await workspaceService.deleteFileFromWorkspace(req.params.id as string, fileKey as string);
    res.json({ success: true, message: 'File deleted' });
  } catch (error) {
    handleError(error, res);
  }
};
