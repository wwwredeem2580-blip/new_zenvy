import { Router } from 'express';
import { requireAuth, requireRole } from '../../middlewares/auth';

import * as adminController from './controller';
import * as workspaceController from './workspace.controller';
import * as invitationController from './invitation.controller';
import * as branchController from '../branch/controller';
import * as paymentSettingsController from './paymentSettings.controller';
import * as contactSettingsController from './contactSettings.controller';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Branch Management
router.get('/branches', requireAuth, requireRole('admin'), branchController.listAdminBranches);
router.post('/branches', requireAuth, requireRole('admin'), branchController.createBranch);
router.put('/branches/:id', requireAuth, requireRole('admin'), branchController.updateBranch);
router.delete('/branches/:id', requireAuth, requireRole('admin'), branchController.deleteBranch);

// Analytics
router.get('/analytics', requireAuth, requireRole('admin'), adminController.getAnalytics);

// Staff Management
router.get('/agents', requireAuth, requireRole('admin', 'agent'), adminController.listAgents);
router.get('/invitations', requireAuth, requireRole('admin'), invitationController.listInvitations);
router.post('/invitations', requireAuth, requireRole('admin'), invitationController.createInvitation);
router.delete('/invitations/:id', requireAuth, requireRole('admin'), invitationController.revokeInvitation);

// User Management
router.get('/users', requireAuth, requireRole('admin'), adminController.listUsers);
router.get('/users/search', requireAuth, requireRole('admin', 'agent'), adminController.findUser);
router.post('/users/minimal', requireAuth, requireRole('admin', 'agent'), adminController.createMinimalUser);
router.patch('/users/:id/role', requireAuth, requireRole('admin'), adminController.updateUserRole);
router.patch('/users/:id/permissions', requireAuth, requireRole('admin'), adminController.updateUserPermissions);
router.post('/users/:id/credits', requireAuth, requireRole('admin'), adminController.addCredits);

// Workspace Management
router.get('/workspaces', requireAuth, requireRole('admin', 'agent'), workspaceController.listWorkspaces);
router.post('/workspaces', requireAuth, requireRole('admin'), workspaceController.createWorkspace);
router.patch('/workspaces/:id', requireAuth, requireRole('admin'), workspaceController.updateWorkspace);
router.delete('/workspaces/:id', requireAuth, requireRole('admin'), workspaceController.deleteWorkspace);

// File Management in Workspaces
router.get('/workspaces/:id/files', requireAuth, requireRole('admin', 'agent'), workspaceController.listFilesInWorkspace);
router.post('/workspaces/:id/files', requireAuth, requireRole('admin', 'agent'), upload.single('file'), workspaceController.uploadFile);
router.delete('/workspaces/:id/files', requireAuth, requireRole('admin', 'agent'), workspaceController.deleteFile);
router.get('/workspaces/:id/preview', requireAuth, requireRole('admin', 'agent'), workspaceController.getPreviewUrl);

// Payment Settings
router.get('/payment-settings', requireAuth, requireRole('admin'), paymentSettingsController.getPaymentSettings);
router.put('/payment-settings', requireAuth, requireRole('admin'), paymentSettingsController.updatePaymentSettings);
router.post('/payment-settings/qr', requireAuth, requireRole('admin'), upload.single('qrImage'), paymentSettingsController.uploadQrCode);

// Contact Settings
router.get('/contact-settings', requireAuth, requireRole('admin'), contactSettingsController.getContactSettings);
router.put('/contact-settings', requireAuth, requireRole('admin'), contactSettingsController.updateContactSettings);

router.get('/health', requireAuth, requireRole('admin'), (_req, res) => {
  res.json({ success: true, message: 'Admin router is active' });
});

export default router;
