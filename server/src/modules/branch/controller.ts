import { Request, Response } from 'express';
import * as branchService from './service';
import { handleError } from '../../utils/handleError';
import { BranchSchema } from './schema';

export const listPublicBranches = async (req: Request, res: Response): Promise<void> => {
  try {
    const branches = await branchService.listBranches(false);
    res.json({ success: true, branches });
  } catch (error) {
    handleError(error, res);
  }
};

export const listAdminBranches = async (req: Request, res: Response): Promise<void> => {
  try {
    const branches = await branchService.listBranches(true);
    res.json({ success: true, branches });
  } catch (error) {
    handleError(error, res);
  }
};

export const createBranch = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = BranchSchema.parse(req.body);
    const branch = await branchService.createBranch(data);
    res.status(201).json({ success: true, branch });
  } catch (error) {
    handleError(error, res);
  }
};

export const updateBranch = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data = BranchSchema.parse(req.body);
    const branch = await branchService.updateBranch(id as string, data);
    res.json({ success: true, branch });
  } catch (error) {
    handleError(error, res);
  }
};

export const deleteBranch = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await branchService.deleteBranch(id as string);
    res.json({ success: true, message: 'Branch deleted successfully' });
  } catch (error) {
    handleError(error, res);
  }
};
