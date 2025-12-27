import express from 'express';
import schedulesRoutes from '../modules/schedules/schedules.routes.js';
import usersRoutes from '../modules/users/users.routes.js';
import preferencesRoutes from '../modules/preferences/preferences.routes.js';
// import importTasksRoutes from '../modules/importTasks/routes/index.js'; // DISABLED FOR LAUNCH

const router = express.Router();

// Health check
router.get('/health', (req, res) => {
    res.status(200).json({ success: true });
});

// Module routes
router.use('/schedules', schedulesRoutes);
router.use('/users', usersRoutes);
router.use('/preferences', preferencesRoutes);
// router.use('/import', importTasksRoutes); // DISABLED FOR LAUNCH - will enable after launch

export default router;