import { Workspace, IWorkspace, WorkspacePermission } from '../../models/Workspace.model';
import { Application } from '../../models/Application.model';
import CustomError from '../../utils/CustomError';
import * as backblaze from '../../lib/backblaze';
import mongoose from 'mongoose';
import { PutObjectCommand } from '@aws-sdk/client-s3';

/**
 * Ensures the system "Application Documents" workspace exists.
 */
export const ensureSystemWorkspace = async () => {
  const systemName = 'Application Documents';
  let ws = await Workspace.findOne({ name: systemName });
  if (!ws) {
    ws = await Workspace.create({
      name: systemName,
      isSystem: true,
      permission: 'Restricted',
    });
  }
  return ws;
};

export const ensureInvoicesWorkspace = async () => {
  const invoicesName = 'Invoices';
  let ws = await Workspace.findOne({ name: invoicesName });
  if (!ws) {
    ws = await Workspace.create({
      name: invoicesName,
      isSystem: true,
      permission: 'Restricted',
    });
  }
  return ws;
};

export const listWorkspaces = async (user?: any) => {
  await ensureSystemWorkspace();
  await ensureInvoicesWorkspace();
  
  const query: any = {};
  if (user && user.role === 'agent') {
    query.$or = [
      { permission: { $in: ['Public', 'Read-only'] } },
      { permission: 'Restricted', allowedAgents: new mongoose.Types.ObjectId(user.userId) }
    ];
  }
  
  return Workspace.find(query).sort({ isSystem: -1, name: 1 });
};

export const createWorkspace = async (data: { name: string; permission: WorkspacePermission; allowedAgents?: string[] }) => {
  const existing = await Workspace.findOne({ name: data.name });
  if (existing) throw new CustomError('Workspace already exists', 400);

  const workspace = await Workspace.create({
    ...data,
    allowedAgents: data.allowedAgents?.map(id => new mongoose.Types.ObjectId(id)) || [],
  });

  // Create a placeholder file in Backblaze to ensure the "folder" (prefix) is visible
  const placeholderKey = `workspaces/${workspace._id}/.keep`;
  const command = new PutObjectCommand({
    Bucket: process.env.BACKBLAZE_BUCKET_NAME!,
    Key: placeholderKey,
    Body: '',
    ContentType: 'text/plain',
  });
  await backblaze.s3Client.send(command);

  return workspace;
};

export const updateWorkspace = async (id: string, data: Partial<IWorkspace>) => {
  const workspace = await Workspace.findById(id);
  if (!workspace) throw new CustomError('Workspace not found', 404);
  if (workspace.isSystem && data.name && data.name !== workspace.name) {
    throw new CustomError('Cannot rename system workspace', 400);
  }

  Object.assign(workspace, data);
  await workspace.save();
  return workspace;
};

export const deleteWorkspace = async (id: string) => {
  const workspace = await Workspace.findById(id);
  if (!workspace) throw new CustomError('Workspace not found', 404);
  if (workspace.isSystem) throw new CustomError('Cannot delete system workspace', 400);

  // Delete all files in Backblaze for this workspace
  const prefix = `workspaces/${workspace._id}/`;
  await backblaze.deleteFolder(prefix);

  await Workspace.findByIdAndDelete(id);
  return { success: true };
};

export const listFilesInWorkspace = async (id: string) => {
  const workspace = await Workspace.findById(id);
  if (!workspace) throw new CustomError('Workspace not found', 404);

  if (workspace.isSystem) {
    // For system workspace, aggregate all application attachments
    const applications = await Application.find({ 'attachments.0': { $exists: true } });
    const allFiles = applications.flatMap(app => 
      app.attachments.map(att => ({
        id: att.url,
        name: att.name,
        uploadedBy: att.uploadedBy,
        uploadedAt: att.uploadedAt,
        url: att.url,
        applicationId: app.applicationId,
        size: 'N/A', // We don't store size yet
      }))
    );
    return allFiles.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());
  }

  const prefix = `workspaces/${workspace._id}/`;
  const objects = await backblaze.listObjects(prefix);
  
  return objects.map(obj => ({
    id: obj.Key,
    name: obj.Key?.replace(prefix, '') || 'Unknown',
    size: `${(obj.Size || 0) / 1024 > 1024 ? ((obj.Size || 0) / (1024*1024)).toFixed(2) + ' MB' : ((obj.Size || 0) / 1024).toFixed(2) + ' KB'}`,
    uploadedAt: obj.LastModified,
    uploadedBy: 'System',
    url: obj.Key,
  }));
};

export const uploadFileToWorkspace = async (id: string, file: Express.Multer.File, uploaderName: string, user?: any) => {
  const workspace = await Workspace.findById(id);
  if (!workspace) throw new CustomError('Workspace not found', 404);
  if (workspace.isSystem) throw new CustomError('Cannot upload directly to system workspace. Upload via individual applications.', 400);

  if (user && user.role === 'agent') {
    if (workspace.permission === 'Read-only') {
      throw new CustomError('Upload denied: Workspace is read-only', 403);
    }
    if (workspace.permission === 'Restricted' && !workspace.allowedAgents.some(agentId => agentId.toString() === user.userId)) {
      throw new CustomError('Upload denied: Access restricted', 403);
    }
  }

  const timestamp = Date.now();
  const sanitizedFilename = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
  const objectKey = `workspaces/${workspace._id}/${timestamp}-${sanitizedFilename}`;

  const command = new PutObjectCommand({
    Bucket: process.env.BACKBLAZE_BUCKET_NAME!,
    Key: objectKey,
    Body: file.buffer,
    ContentType: file.mimetype,
  });

  await backblaze.s3Client.send(command);

  return {
    id: objectKey,
    name: file.originalname,
    url: objectKey,
    uploadedBy: uploaderName,
    uploadedAt: new Date(),
  };
};

export const deleteFileFromWorkspace = async (id: string, fileKey: string) => {
  const workspace = await Workspace.findById(id);
  if (!workspace) throw new CustomError('Workspace not found', 404);
  
  if (workspace.isSystem) {
    // For system workspace, we must delete from the application's attachments
    const app = await Application.findOne({ 'attachments.url': fileKey });
    if (!app) throw new CustomError('File not found in any application', 404);
    
    app.attachments = app.attachments.filter(att => att.url !== fileKey);
    await app.save();
    
    // Also delete from Backblaze
    await backblaze.deleteObject(fileKey);
  } else {
    // Security: Ensure the fileKey actually belongs to this workspace
    if (!fileKey.startsWith(`workspaces/${workspace._id}/`)) {
      throw new CustomError('File does not belong to this workspace', 403);
    }
    await backblaze.deleteObject(fileKey);
  }

  return { success: true };
};

export const getFilePreviewUrl = async (id: string, fileKey: string) => {
  const workspace = await Workspace.findById(id);
  if (!workspace) throw new CustomError('Workspace not found', 404);

  // Security: If not system workspace, ensure the key belongs to it
  if (!workspace.isSystem && !fileKey.startsWith(`workspaces/${workspace._id}/`)) {
    throw new CustomError('Access denied to this file', 403);
  }

  // Generate a short-lived preview URL (10 minutes)
  const previewUrl = await backblaze.generatePreviewUrl(fileKey, 600);
  return { previewUrl };
};
