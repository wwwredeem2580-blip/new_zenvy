import { Request, Response } from 'express';
import { handleError } from '../../utils/handleError';
import * as serviceService from './service';

export const list = async (req: Request, res: Response): Promise<void> => {
  try {
    const services = await serviceService.getAllServices();
    res.status(200).json({ success: true, services });
  } catch (error) {
    handleError(error, res);
  }
};

export const createUpdate = async (req: Request, res: Response): Promise<void> => {
  try {
    const service = await serviceService.createOrUpdateService(req.body);
    res.status(200).json({ success: true, service });
  } catch (error) {
    handleError(error, res);
  }
};

export const remove = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await serviceService.deleteService(id as string);
    res.status(200).json({ success: true });
  } catch (error) {
    handleError(error, res);
  }
};
