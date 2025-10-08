import express from 'express';
import schedulesRoutes from '../modules/schedules/schedules.routes.js';
import usersRoutes from '../modules/users/users.routes.js';
import preferencesRoutes from '../modules/preferences/preferences.routes.js';

const router = express.Router();

// Health check
router.get('/health', (req, res) => {
    res.status(200).json({ success: true });
});

// Module routes
router.use('/schedules', schedulesRoutes);
router.use('/users', usersRoutes);
router.use('/preferences', preferencesRoutes);

export default router;