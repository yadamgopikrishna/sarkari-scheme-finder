const Notification = require('../models/Notification');

// @desc    Get system and personalized notifications
// @route   GET /api/notifications
// @access  Public (Optionally authenticated)
const getNotifications = async (req, res) => {
  try {
    const filter = {
      $or: [{ isGlobal: true }],
    };

    if (req.user) {
      filter.$or.push({ userId: req.user._id });
    }

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    const formatted = notifications.map((n) => ({
      ...n,
      isRead: req.user
        ? (n.readBy || []).some((uid) => uid.toString() === req.user._id.toString())
        : false,
    }));

    res.json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark a notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    if (!notification.readBy.includes(req.user._id)) {
      notification.readBy.push(req.user._id);
      await notification.save();
    }

    res.json({ success: true, message: 'Notification marked as read.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
};
