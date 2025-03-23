import Message from '../../models/chat/Message.js';
import User from '../../models/User.js';

// Send message
export const sendMessage = async (req, res) => {
  try {
    const { receiverId, content, relatedTo } = req.body;
    
    // Validate required fields
    if (!receiverId || !content) {
      return res.status(400).json({
        success: false,
        error: 'Vui lòng cung cấp đầy đủ thông tin: receiverId và content'
      });
    }
    
    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    
    if (!receiver) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy người nhận'
      });
    }
    
    // Create message
    const message = await Message.create({
      sender: req.user.id,
      receiver: receiverId,
      content,
      relatedTo: relatedTo || {}
    });
    
    // Populate sender and receiver info
    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name avatar')
      .populate('receiver', 'name avatar');
    
    // Create notification for receiver
    await Notification.create({
      user: receiverId,
      type: 'message',
      title: 'Tin nhắn mới',
      message: `Bạn có tin nhắn mới từ ${req.user.name}`,
      relatedTo: {
        model: 'Message',
        id: message._id
      },
      link: `/messages/${req.user.id}`
    });
    
    res.status(201).json({
      success: true,
      data: populatedMessage
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Get conversation between two users
export const getConversation = async (req, res) => {
  try {
    const otherUserId = req.params.userId;
    
    // Find messages in both directions
    const messages = await Message.find({
      $or: [
        { sender: req.user.id, receiver: otherUserId },
        { sender: otherUserId, receiver: req.user.id }
      ]
    })
    .populate('sender', 'name avatar')
    .populate('receiver', 'name avatar')
    .sort({ createdAt: 1 });
    
    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Get all user's conversations
export const getUserConversations = async (req, res) => {
  try {
    // Find all users this user has exchanged messages with
    const sentMessages = await Message.find({ sender: req.user.id })
      .distinct('receiver');
    
    const receivedMessages = await Message.find({ receiver: req.user.id })
      .distinct('sender');
    
    // Combine and remove duplicates
    const conversationUserIds = [...new Set([...sentMessages, ...receivedMessages])];
    
    // Get the last message from each conversation
    const conversations = await Promise.all(
      conversationUserIds.map(async (userId) => {
        // Get the last message
        const lastMessage = await Message.findOne({
          $or: [
            { sender: req.user.id, receiver: userId },
            { sender: userId, receiver: req.user.id }
          ]
        })
        .sort({ createdAt: -1 })
        .populate('sender', 'name avatar')
        .populate('receiver', 'name avatar');
        
        // Count unread messages
        const unreadCount = await Message.countDocuments({
          sender: userId,
          receiver: req.user.id,
          read: false
        });
        
        // Get user info
        const user = await User.findById(userId).select('name avatar');
        
        return {
          user,
          lastMessage,
          unreadCount
        };
      })
    );
    
    // Sort conversations by the last message date
    conversations.sort((a, b) => 
      b.lastMessage.createdAt - a.lastMessage.createdAt
    );
    
    res.status(200).json({
      success: true,
      count: conversations.length,
      data: conversations
    });
  } catch (error) {
    console.error('Get user conversations error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Mark messages as read
export const markMessagesAsRead = async (req, res) => {
  try {
    const senderId = req.params.senderId;
    
    // Update all unread messages from this sender
    const result = await Message.updateMany(
      { 
        sender: senderId,
        receiver: req.user.id,
        read: false
      },
      { read: true }
    );
    
    res.status(200).json({
      success: true,
      count: result.modifiedCount,
      message: `Đã đánh dấu ${result.modifiedCount} tin nhắn là đã đọc`
    });
  } catch (error) {
    console.error('Mark messages as read error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};