import { Router } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../../middleware/authMiddleware';
import { Community } from '../../models/Community';
import { Message } from '../../models/Message';

const router = Router();

// Create a new community
router.post('/communities', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const { name, description, privacy } = req.body;
    const ownerId = req.userId;

    const community = new Community({
      name,
      description,
      privacy,
      ownerId,
      members: [ownerId],
      roles: { admins: [ownerId] }
    });

    await community.save();
    res.status(201).json(community);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all public communities
router.get('/communities', async (req, res) => {
    try {
        const communities = await Community.find({ privacy: 'public' }).populate('ownerId', 'displayName');
        res.json(communities);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get messages for a community
router.get('/communities/:id/messages', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        // In a real app, you'd add pagination
        const messages = await Message.find({ communityId: id }).sort({ createdAt: -1 }).limit(50).populate('senderId', 'displayName');
        res.json(messages.reverse());
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});


export default router;
