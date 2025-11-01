import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import * as ctrl from './users.controllers.js';
import { 
    validateCreateUser, 
    validateUpdateUserProfile, 
    validateClerkWebhook 
} from './users.validators.js';

// Configure multer for avatar uploads
const uploadDir = 'uploads/avatars';

// Create upload directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Create unique filename with timestamp and original extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `avatar-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const fileFilter = (req, file, cb) => {
    // Only allow image files
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed'), false);
    }
};

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: fileFilter
});

const router = express.Router();

/**
 * Users Routes
 * --------------------------------
 */

// POST /users - create new user (registration)
router.post('/', validateCreateUser, ctrl.createUser);

// GET /users/profile - get current user profile
router.get('/profile', ctrl.getUserProfile);

// PUT /users/profile - update user profile
router.put('/profile', validateUpdateUserProfile, ctrl.updateUserProfile);

// DELETE /users/profile - delete user account
router.delete('/profile', ctrl.deleteUser);

// POST /users/auth/login - user login (validate user exists, create if needed)
router.post('/auth/login', ctrl.loginUser);

// POST /users/auth/logout - user logout
router.post('/auth/logout', ctrl.logoutUser);

// POST /users/auth/refresh - refresh auth token
router.post('/auth/refresh', ctrl.refreshToken);

// POST /users/webhooks/clerk - Clerk webhook handler
router.post('/webhooks/clerk', validateClerkWebhook, ctrl.handleClerkWebhook);

// POST /users/sync - Manual sync user from Clerk (for testing)
router.post('/sync', ctrl.syncUserFromClerk);

// POST /users/upload-avatar - Upload user avatar image
router.post('/upload-avatar', upload.single('profileImage'), ctrl.uploadAvatar);

// GET /users/webhooks/test - Test webhook endpoint (for debugging)
router.get('/webhooks/test', (req, res) => {
    res.status(200).json({ 
        success: true, 
        message: 'Webhook endpoint is reachable',
        timestamp: new Date().toISOString()
    });
});

export default router;