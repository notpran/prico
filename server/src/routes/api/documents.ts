import { Router } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../../middleware/authMiddleware';
import { Document } from '../../models/Document';
import { Community } from '../../models/Community';

const router = Router();

// Create a new document in a community
router.post('/documents', authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
        const { name, communityId } = req.body;
        const ownerId = req.userId;

        // Check if user is a member of the community
        const community = await Community.findById(communityId);
        if (!community || !community.members.includes(ownerId as any)) {
            return res.status(403).json({ message: 'You are not a member of this community' });
        }

        const document = new Document({
            name,
            communityId,
            ownerId,
        });

        await document.save();
        res.status(201).json(document);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all documents for a community
router.get('/communities/:id/documents', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const documents = await Document.find({ communityId: id }).populate('ownerId', 'displayName');
        res.json(documents);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
