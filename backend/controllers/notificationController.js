const { query } = require('../config/db');

// GET /api/notifications
const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    // Students get their own notifications, Admins get global notifications or their own
    let sql = `
      SELECT n.*, u.name as user_name
      FROM notifications n
      JOIN users u ON n.user_id = u.id
    `;
    const params = [];

    if (req.user.role !== 'admin') {
      sql += ` WHERE n.user_id = ?`;
      params.push(userId);
    }

    sql += ` ORDER BY n.created_at DESC LIMIT 30`;

    const notifications = await query(sql, params);
    const unreadCount = notifications.filter(n => parseInt(n.is_read) === 0).length;

    return res.json({
      success: true,
      unreadCount,
      notifications
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch notifications.', error: err.message });
  }
};

// PUT /api/notifications/:id/read
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    await query('UPDATE notifications SET is_read = 1 WHERE id = ?', [id]);
    return res.json({ success: true, message: 'Notification marked as read.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update notification.', error: err.message });
  }
};

// PUT /api/notifications/read-all
const markAllRead = async (req, res) => {
  try {
    const userId = req.user.id;
    if (req.user.role === 'admin') {
      await query('UPDATE notifications SET is_read = 1');
    } else {
      await query('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [userId]);
    }
    return res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to mark notifications read.', error: err.message });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllRead
};
