import express from 'express';
import {
  sendMessage,
  getConversation,
  getUserConversations,
  markMessagesAsRead
} from '../../controllers/chat/messageController.js';
import { protect } from '../../middlewares/auth.js';

const router = express.Router();

// Send message
router.post('/', protect, sendMessage);

// Get conversation between two users
router.get('/conversation/:userId', protect, getConversation);

// Get all user's conversations
router.get('/conversations', protect, getUserConversations);

// Mark messages as read
router.put('/read/:senderId', protect, markMessagesAsRead);

export default router;