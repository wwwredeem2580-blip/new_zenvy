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
