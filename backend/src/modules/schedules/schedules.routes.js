import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import * as schedulesValidators from './schedules.validators.js';
import * as schedulesControllers from './schedules.controllers.js';

const router = Router();

// Schedule CRUD operations
router.post('/', 
    validate(schedulesValidators.createScheduleSchema), 
    schedulesControllers.saveNewSchedule
);

router.get('/', 
    validate(schedulesValidators.getSchedulesQuerySchema, 'query'), 
    schedulesControllers.getSchedules
);

router.get('/:id', 
    validate(schedulesValidators.scheduleIdParamSchema, 'params'), 
    schedulesControllers.getScheduleById
);

router.put('/:id', 
    validate(schedulesValidators.scheduleIdParamSchema, 'params'),
    validate(schedulesValidators.updateScheduleSchema), 
    schedulesControllers.updateSchedule
);

router.delete('/:id', 
    validate(schedulesValidators.scheduleIdParamSchema, 'params'), 
    schedulesControllers.deleteSchedule
);

// Block operations
router.post('/:id/blocks', 
    validate(schedulesValidators.scheduleIdParamSchema, 'params'),
    (req, res, next) => {
        // Check if it's multiple blocks or single block
        if (req.body.blocks) {
            return validate(schedulesValidators.createMultipleBlocksSchema)(req, res, next);
        } else {
            return validate(schedulesValidators.createBlockSchema)(req, res, next);
        }
    },
    schedulesControllers.addBlocks
);

router.put('/:id/blocks/:blockId', 
    validate(schedulesValidators.scheduleAndBlockIdParamSchema, 'params'),
    validate(schedulesValidators.updateBlockSchema),
    schedulesControllers.updateBlock
);

router.delete('/:id/blocks/:blockId', 
    validate(schedulesValidators.scheduleAndBlockIdParamSchema, 'params'),
    schedulesControllers.deleteBlock
);

// Bulk operations
router.post('/:id/apply-ops', 
    validate(schedulesValidators.scheduleIdParamSchema, 'params'),
    validate(schedulesValidators.diffOpsSchema),
    schedulesControllers.applyOps
);

// Helper endpoints
router.get('/:id/blocks/date-range', 
    validate(schedulesValidators.scheduleIdParamSchema, 'params'),
    validate(schedulesValidators.dateRangeQuerySchema, 'query'),
    schedulesControllers.getBlocksInDateRange
);

router.patch('/:id/blocks/:blockId/complete', 
    validate(schedulesValidators.scheduleAndBlockIdParamSchema, 'params'),
    schedulesControllers.markBlockCompleted
);

export default router;