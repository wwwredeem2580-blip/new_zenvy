import { Application, IApplication, ApplicationStatus } from '../../models/Application.model';
import { User } from '../../models/User.model';
import { CreateApplicationInput } from './schema';
import CustomError from '../../utils/CustomError';
import mongoose from 'mongoose';
import { generatePreviewUrl } from '../../lib/backblaze';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { addEmailJob } from '../../workers/email.queue';
import { generateAndUploadInvoice } from '../../utils/invoice.service';
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
  const query = mongoose.Types.ObjectId.isValid(applicationId) 
    ? { _id: applicationId } 
    : { applicationId };

  const application = await Application.findOne(query);
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
 * Agents only see applications assigned to them.
 */
export const getAllApplications = async (userRole: string, userId: string): Promise<IApplication[]> => {
  const query: any = {};
  if (userRole === 'agent') {
    query.reviewerId = new mongoose.Types.ObjectId(userId);
  }

  return Application.find(query)
    .populate('userId', 'firstName lastName email balance')
    .sort({ createdAt: -1 });
};

const s3Client = new S3Client({
  region: 'eu-central-003',
  endpoint: process.env.BACKBLAZE_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.BACKBLAZE_KEY_ID!,
    secretAccessKey: process.env.BACKBLAZE_APP_KEY!,
  },
});

/**
 * uploadAttachment - Uploads a file buffer to Backblaze and returns the objectKey.
 */
export const uploadAttachment = async (userId: string, file: Express.Multer.File) => {
  const timestamp = Date.now();
  const sanitizedFilename = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
  const objectKey = `users/${userId}/applications/${timestamp}-${sanitizedFilename}`;

  const command = new PutObjectCommand({
    Bucket: process.env.BACKBLAZE_BUCKET_NAME!,
    Key: objectKey,
    Body: file.buffer,
    ContentType: file.mimetype,
  });

  await s3Client.send(command);

  return {
    objectKey,
    filename: file.originalname,
  };
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
  const query = mongoose.Types.ObjectId.isValid(applicationId) 
    ? { _id: applicationId } 
    : { applicationId };

  const application = await Application.findOne(query);
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

/**
 * updatePaymentStatus - Updates the payment status of an application.
 */
export const updatePaymentStatus = async (
  applicationId: string,
  status: 'Pending' | 'Received',
  actor: { name: string; id: string }
) => {
  const query = mongoose.Types.ObjectId.isValid(applicationId) 
    ? { _id: applicationId } 
    : { applicationId };
    
  const application = await Application.findOne(query);
  if (!application) throw new CustomError('Application not found', 404);

  application.paymentStatus = status;
  application.activityLog.push({
    type: 'financial',
    description: `Payment status updated to ${status}.`,
    actorName: actor.name,
    actorId: actor.id,
    timestamp: new Date(),
  });

  if (status === 'Received') {
    try {
      const invoiceData = await generateAndUploadInvoice(application);
      application.attachments.push({
        name: invoiceData.name,
        url: invoiceData.url,
        uploadedBy: 'System (Auto-generated)',
        uploadedById: 'system',
        uploadedAt: new Date(),
      });
      application.activityLog.push({
        type: 'document',
        description: `Invoice ${invoiceData.name} automatically generated and attached.`,
        actorName: 'System',
        actorId: 'system',
        timestamp: new Date(),
      });
    } catch (err) {
      console.error('Failed to generate invoice:', err);
    }
  }

  await application.save();

  // Send email notification for payment status
  await addEmailJob('APPLICATION_UPDATE', {
    email: (application as any).email,
    name: (application as any).name,
    applicationId: application.applicationId,
    updateType: status === 'Received' ? 'PAYMENT_APPROVED' : 'PAYMENT_REJECTED',
    subject: status === 'Received' ? 'Payment Verified — Smart CAF' : 'Action Required: Payment Issue — Smart CAF'
  });

  return application;
};

/**
 * assignApplication - Assigns an application to an agent or admin.
 */
export const assignApplication = async (
  applicationId: string,
  reviewerId: string,
  actor: { name: string; id: string }
) => {
  const query = mongoose.Types.ObjectId.isValid(applicationId) 
    ? { _id: applicationId } 
    : { applicationId };

  const application = await Application.findOne(query);
  if (!application) throw new CustomError('Application not found', 404);

  // Requirement: Payment must be received
  if (application.paymentStatus !== 'Received') {
    throw new CustomError('Cannot assign agent until payment is received/approved.', 400);
  }

  const reviewer = await User.findById(reviewerId);
  if (!reviewer) throw new CustomError('Reviewer not found', 404);
  if (reviewer.role !== 'agent' && reviewer.role !== 'admin') {
    throw new CustomError('Assigned user must be an agent or admin.', 400);
  }

  application.reviewerId = new mongoose.Types.ObjectId(reviewerId);
  application.reviewerName = `${reviewer.firstName} ${reviewer.lastName}`;
  application.status = 'Reviewing';
  application.lastActivityAt = new Date();

  application.activityLog.push({
    type: 'assignment',
    description: `Application assigned to ${application.reviewerName}. Status updated to Reviewing.`,
    actorName: actor.name,
    actorId: actor.id,
    timestamp: new Date(),
  });

  await application.save();
  
  // Send email notification for agent assignment
  await addEmailJob('APPLICATION_UPDATE', {
    email: (application as any).email,
    name: (application as any).name,
    applicationId: application.applicationId,
    updateType: 'AGENT_ASSIGNED',
    agentName: application.reviewerName,
    subject: `Review started for #${application.applicationId} — Smart CAF`
  });
  
  return application;
};

/**
 * updateStatus - Updates the status of an application.
 */
export const updateStatus = async (
  applicationId: string,
  status: ApplicationStatus,
  actor: { name: string; id: string }
) => {
  const query = mongoose.Types.ObjectId.isValid(applicationId) 
    ? { _id: applicationId } 
    : { applicationId };

  const application = await Application.findOne(query);
  if (!application) throw new CustomError('Application not found', 404);

  application.status = status;
  application.activityLog.push({
    type: 'status',
    description: `Status updated to ${status}.`,
    actorName: actor.name,
    actorId: actor.id,
    timestamp: new Date(),
  });

  await application.save();

  // Send email notification for status update
  await addEmailJob('APPLICATION_UPDATE', {
    email: (application as any).email,
    name: (application as any).name,
    applicationId: application.applicationId,
    updateType: 'STATUS_UPDATED',
    newStatus: status,
    subject: `Application Status Updated: ${status} — Smart CAF`
  });

  return application;
};

/**
 * unassignApplication - Removes the assigned agent from an application.
 */
export const unassignApplication = async (
  applicationId: string,
  actor: { name: string; id: string }
) => {
  const query = mongoose.Types.ObjectId.isValid(applicationId) 
    ? { _id: applicationId } 
    : { applicationId };

  const application = await Application.findOne(query);
  if (!application) throw new CustomError('Application not found', 404);

  const previousReviewer = application.reviewerName;
  application.reviewerId = undefined;
  application.reviewerName = undefined;
  application.status = 'Pending';
  application.lastActivityAt = new Date();

  application.activityLog.push({
    type: 'reassignment',
    description: `Agent ${previousReviewer || 'Unknown'} unassigned. Status reverted to Pending.`,
    actorName: actor.name,
    actorId: actor.id,
    timestamp: new Date(),
  });

  await application.save();
  return application;
};

/**
 * addNote - Adds a communication note to an application.
 */
export const addNote = async (
  applicationId: string,
  note: { text: string; authorId: string; authorName: string }
) => {
  const query = mongoose.Types.ObjectId.isValid(applicationId) 
    ? { _id: applicationId } 
    : { applicationId };

  const application = await Application.findOne(query);
  if (!application) throw new CustomError('Application not found', 404);

  application.notes.push({
    ...note,
    createdAt: new Date()
  });
  
  application.lastActivityAt = new Date();
  await application.save();
  return application;
};

/**
 * addAttachment - Uploads and associates a file with an application.
 */
export const addAttachment = async (
  applicationId: string,
  userId: string,
  file: Express.Multer.File,
  uploaderName: string
) => {
  // 1. Upload to storage
  const uploadResult = await uploadAttachment(userId, file);

  // 2. Find application
  const query = mongoose.Types.ObjectId.isValid(applicationId) 
    ? { _id: applicationId } 
    : { applicationId };

  const application = await Application.findOne(query);
  if (!application) throw new CustomError('Application not found', 404);

  // 3. Add to attachments
  application.attachments.push({
    name: file.originalname,
    url: uploadResult.objectKey,
    uploadedBy: uploaderName,
    uploadedById: userId,
    uploadedAt: new Date()
  });

  application.lastActivityAt = new Date();
  
  // Add to activity log
  application.activityLog.push({
    type: 'upload',
    description: `Document "${file.originalname}" uploaded by ${uploaderName}.`,
    actorName: uploaderName,
    actorId: userId,
    timestamp: new Date()
  });

  await application.save();
  return application;
};
