import { Service, IService } from '../../models/Service.model';
import CustomError from '../../utils/CustomError';

export const getAllServices = async (): Promise<IService[]> => {
  return Service.find().sort({ createdAt: 1 });
};

export const createOrUpdateService = async (data: any): Promise<IService> => {
  const { id } = data;
  const existing = await Service.findOne({ id });

  if (existing) {
    Object.assign(existing, data);
    return existing.save();
  }

  return Service.create(data);
};

export const deleteService = async (id: string): Promise<void> => {
  const result = await Service.deleteOne({ id });
  if (result.deletedCount === 0) {
    throw new CustomError('Service not found', 404);
  }
};

export const seedServices = async (services: any[]) => {
  for (const s of services) {
    await createOrUpdateService(s);
  }
};
