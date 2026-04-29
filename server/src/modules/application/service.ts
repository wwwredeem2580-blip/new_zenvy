import { Application, IApplication } from '../../models/Application.model';
import { User } from '../../models/User.model';
import { CreateApplicationInput } from './schema';
import CustomError from '../../utils/CustomError';
import mongoose from 'mongoose';
import { generateUploadUrl, generatePreviewUrl } from '../../lib/backblaze';

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

  // Fetch user for balance check and activity log
  const user = await User.findById(userId);
  if (!user) throw new CustomError('User not found', 404);

  // Handle Credits payment
  if (data.paymentMethod === 'Credits') {
    const totalCost = data.selectedServices.reduce((sum, s) => sum + s.price, 0);
    if (user.balance < totalCost) {
      throw new CustomError('Insufficient credit balance', 400);
    }
    user.balance -= totalCost;
    await user.save();
  }

  const application = await Application.create({
    ...data,
    userId: new mongoose.Types.ObjectId(userId),
    applicationId,
    status: 'Pending',
    paymentStatus: data.paymentMethod === 'Credits' ? 'Received' : 'Pending',
    activityLog: [
      {
        type: 'financial',
        description: `Application submitted via ${data.paymentMethod}. ${data.paymentMethod === 'Credits' ? 'Payment received from balance.' : 'Payment Status: Pending.'}`,
        actorName: `${user.firstName} ${user.lastName}`,
        actorId: user._id.toString(),
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
  return Application.find({ userId: new mongoose.Types.ObjectId(userId) })
    .populate('userId', 'firstName lastName email balance')
    .sort({
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
  return Application.find({})
    .populate('userId', 'firstName lastName email balance')
    .sort({ createdAt: -1 });
};

/**
 * getSignedUploadUrl - Generates a secure upload link for the frontend.
 */
export const getSignedUploadUrl = async (userId: string, filename: string, contentType: string) => {
  // Validate content type (Images and PDFs only as per requirements)
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  if (!allowedTypes.includes(contentType)) {
    throw new CustomError('Invalid file type. Only JPEG, PNG, and PDF are allowed.', 400);
  }
  return generateUploadUrl(userId, filename, contentType);
};

/**
 * getSignedPreviewUrl - Generates a short-lived secure viewing link.
 */
export const getSignedPreviewUrl = async (
  userId: string,
  userRole: string,
  applicationId: string,
  objectKey: string
) => {
  const application = await Application.findOne({ applicationId });
  if (!application) throw new CustomError('Application not found', 404);

  // Security check: Only owner, admin, or assigned agent can view
  const isOwner = application.userId.toString() === userId.toString();
  const isAdmin = userRole === 'admin';
  const isAssignedAgent = userRole === 'agent' && application.reviewerId?.toString() === userId.toString();

  if (!isOwner && !isAdmin && !isAssignedAgent) {
    throw new CustomError('Access denied to this document', 403);
  }

  // Ensure the objectKey actually belongs to this application's attachments
  const hasAttachment = application.attachments.some(a => a.url === objectKey);
  if (!hasAttachment && !isAdmin) {
    throw new CustomError('Document not found in this application', 404);
  }

  return generatePreviewUrl(objectKey);
};
