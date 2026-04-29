import { Request, Response } from 'express';
import { handleError } from '../../utils/handleError';
import * as adminService from './service';

export const listAgents = async (_req: Request, res: Response): Promise<void> => {
  try {
    const agents = await adminService.listAgentsWithWorkload();
    res.status(200).json({ success: true, agents });
  } catch (error) {
    handleError(error, res);
  }
};

export const listUsers = async (_req: Request, res: Response): Promise<void> => {
  try {
    const users = await adminService.listAllUsers();
    res.status(200).json({ success: true, users });
  } catch (error) {
    handleError(error, res);
  }
};

export const updateUserRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const user = await adminService.updateUserRole(id as string, role);
    res.status(200).json({ success: true, user });
  } catch (error) {
    handleError(error, res);
  }
};

export const addCredits = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { amount } = req.body;
    const user = await adminService.addCredits(id as string, amount);
    res.status(200).json({ success: true, user });
  } catch (error) {
    handleError(error, res);
  }
};

export const getAnalytics = async (_req: Request, res: Response): Promise<void> => {
  try {
    const analytics = await adminService.getDashboardAnalytics();
    res.status(200).json({ success: true, analytics });
  } catch (error) {
    handleError(error, res);
  }
};
