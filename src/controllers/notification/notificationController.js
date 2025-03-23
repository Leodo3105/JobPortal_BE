import Notification from '../../models/notification/Notification.js';

// Get user notifications
export const getNotifications = async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const total = await Notification.countDocuments({ user: req.user.id });

    // Get notifications
    const notifications = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);
    
    // Pagination result
    const pagination = {};
    
    if (startIndex + limit < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }
    
    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }
    
    // Count unread notifications
    const unreadCount = await Notification.countDocuments({ 
      user: req.user.id,
      read: false
    });
    
    res.status(200).json({
      success: true,
      count: notifications.length,
      unreadCount,
      pagination,
      data: notifications
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy thông báo'
      });
    }
    
    // Check if notification belongs to user
    if (notification.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Không có quyền truy cập thông báo này'
      });
    }
    
    // Mark as read
    notification.read = true;
    await notification.save();
    
    res.status(200).json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('Mark notification error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user.id, read: false },
      { read: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Đã đánh dấu tất cả thông báo là đã đọc'
    });
  } catch (error) {
    console.error('Mark all notifications error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Delete notification
export const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy thông báo'
      });
    }
    
    // Check if notification belongs to user
    if (notification.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Không có quyền xóa thông báo này'
      });
    }
    
    await notification.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Đã xóa thông báo'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};
