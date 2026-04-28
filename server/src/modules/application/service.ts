import { Application, IApplication } from '../../models/Application.model';
import { CreateApplicationInput } from './schema';
import CustomError from '../../utils/CustomError';
import mongoose from 'mongoose';

/**
 * submitApplication — Creates a new application in the system.
 * Generates a unique CAF-XXXXXX ID.
 */
export const submitApplication = async (
  userId: string,
  data: CreateApplicationInput
): Promise<IApplication> => {
  // Generate unique ID: CAF-XXXXXX
  const randomId = Math.floor(100000 + Math.random() * 900000);
  const applicationId = `CAF-${randomId}`;

  // Check if ID exists (rare but possible)
  const existing = await Application.findOne({ applicationId });
  if (existing) return submitApplication(userId, data); // Recursive retry

  const application = await Application.create({
    ...data,
    userId: new mongoose.Types.ObjectId(userId),
    applicationId,
    status: 'Pending',
    activityLog: [
      {
        type: 'financial',
        description: `Application submitted via ${data.paymentMethod}. Payment Status: Pending.`,
        actorName: 'System',
        actorId: 'system',
        timestamp: new Date(),
      },
    ],
  });

  return application;
};

/**
 * getUserApplications — Retrieves all applications for a specific user.
 */
export const getUserApplications = async (userId: string): Promise<IApplication[]> => {
  return Application.find({ userId: new mongoose.Types.ObjectId(userId) }).sort({
    createdAt: -1,
  });
};

/**
 * getApplicationById — Retrieves a single application with security checks.
 */
export const getApplicationById = async (
  userId: string,
  userRole: string,
  applicationId: string
): Promise<IApplication> => {
  const application = await Application.findOne({ applicationId });
  if (!application) throw new CustomError('Application not found', 404);

  // Security check: Only owner or admin/agent can view
  if (
    userRole === 'client' &&
    application.userId.toString() !== userId.toString()
  ) {
    throw new CustomError('Access denied', 403);
  }

  return application;
};

/**
 * getAllApplications — For admin/agent to see all submissions.
 */
export const getAllApplications = async (): Promise<IApplication[]> => {
  return Application.find({}).sort({ createdAt: -1 });
};
