import { Router } from 'express';
import * as applicationController from './controller';
import { requireAuth, requireRole } from '../../middlewares/auth';

import multer from 'multer';

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Invalid file type'));
  },
});

const router = Router();

// User (Client) Routes
router.post('/', requireAuth, applicationController.create);
router.get('/my', requireAuth, applicationController.getMyApplications);
router.get('/:id', requireAuth, applicationController.getDetails);

// Admin/Agent Routes
router.get('/', requireAuth, requireRole('admin', 'agent'), applicationController.listAll);
router.patch('/:id/payment-status', requireAuth, requireRole('admin', 'agent'), applicationController.updatePaymentStatus);
router.patch('/:id/assign', requireAuth, requireRole('admin', 'agent'), applicationController.assignAgent);
router.patch('/:id/unassign', requireAuth, requireRole('admin', 'agent'), applicationController.unassignAgent);
router.patch('/:id/status', requireAuth, requireRole('admin', 'agent'), applicationController.updateStatus);

// Storage & Communication Routes
router.post('/upload', requireAuth, upload.single('file'), applicationController.upload);
router.post('/:id/attachments', requireAuth, requireRole('admin', 'agent'), upload.single('file'), applicationController.addAttachment);
router.post('/:id/notes', requireAuth, requireRole('admin', 'agent'), applicationController.addNote);
router.get('/:id/attachment-preview', requireAuth, applicationController.getAttachmentPreviewUrl);

export default router;
