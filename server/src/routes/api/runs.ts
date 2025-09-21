import { Router } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../../middleware/authMiddleware';
import { Run } from '../../models/Run';
import { v4 as uuidv4 } from 'uuid';
// This is a placeholder for the actual runner service
import { executeCode } from '../../services/runnerService';

const router = Router();

// Execute code
router.post('/runs', authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
        const { language, code, stdin } = req.body;
        const userId = req.userId;
        const runId = uuidv4();

        const run = new Run({
            language,
            code,
            stdin,
            userId,
            runId,
        });

        await run.save();

        // Asynchronously execute the code
        executeCode(runId, language, code, stdin);

        res.status(202).json({ runId });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get run status and result
router.get('/runs/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const run = await Run.findOne({ runId: id });

        if (!run) {
            return res.status(404).json({ message: 'Run not found' });
        }

        res.json(run);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
