import express from 'express';
import * as ctrl from './users.controllers.js';
import { 
    validateCreateUser, 
    validateUpdateUserProfile, 
    validateClerkWebhook 
} from './users.validators.js';

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

export default router;