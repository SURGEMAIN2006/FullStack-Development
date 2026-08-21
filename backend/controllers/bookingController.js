const { query } = require('../config/db');

const formatDate = (d) => new Date(d).toISOString().split('T')[0];

// GET /api/bookings
const getAllBookings = async (req, res) => {
  try {
    const { search, status, user_id, book_id } = req.query;

    let sql = `
      SELECT bk.*,
             u.name as student_name, u.email as student_email, u.student_id, u.department,
             b.title as book_title, b.author as book_author, b.isbn, b.cover_image, b.available_copies
      FROM bookings bk
      JOIN users u ON bk.user_id = u.id
      JOIN books b ON bk.book_id = b.id
      WHERE 1=1
    `;
    const params = [];

    if (user_id) {
      sql += ` AND bk.user_id = ?`;
      params.push(user_id);
    }

    if (book_id) {
      sql += ` AND bk.book_id = ?`;
      params.push(book_id);
    }

    if (search) {
      sql += ` AND (u.name LIKE ? OR u.student_id LIKE ? OR b.title LIKE ? OR bk.booking_code LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    if (status && status !== 'all') {
      sql += ` AND bk.status = ?`;
      params.push(status);
    }

    sql += ` ORDER BY bk.created_at DESC`;

    const bookings = await query(sql, params);
    return res.json({ success: true, count: bookings.length, bookings });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch bookings.', error: err.message });
  }
};

// POST /api/bookings
const createBooking = async (req, res) => {
  try {
    const { book_id, notes } = req.body;
    const userId = req.user.id; // From JWT

    if (!book_id) {
      return res.status(400).json({ success: false, message: 'Book ID is required.' });
    }

    // Check if book exists
    const books = await query('SELECT title, available_copies FROM books WHERE id = ?', [book_id]);
    if (books.length === 0) {
      return res.status(404).json({ success: false, message: 'Book not found.' });
    }
    const book = books[0];

    // Prevent duplicate active booking by same user
    const existing = await query(`
      SELECT id FROM bookings
      WHERE user_id = ? AND book_id = ? AND status IN ('Pending', 'Approved', 'Reserved')
    `, [userId, book_id]);

    if (existing.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'You already have an active reservation for this book.' 
      });
    }

    // Calculate queue position
    const queueResult = await query(`
      SELECT COUNT(*) as count FROM bookings
      WHERE book_id = ? AND status IN ('Pending', 'Approved', 'Reserved')
    `, [book_id]);
    const queuePosition = (queueResult[0]?.count || queueResult[0]?.['COUNT(*)'] || 0) + 1;

    const bookingCode = `RES-${Math.floor(1000 + Math.random() * 9000)}`;
    const today = formatDate(new Date());

    const result = await query(`
      INSERT INTO bookings (booking_code, user_id, book_id, booking_date, status, queue_position, notes)
      VALUES (?, ?, ?, ?, 'Pending', ?, ?)
    `, [bookingCode, userId, book_id, today, queuePosition, notes || null]);

    // Send notification
    await query(`
      INSERT INTO notifications (user_id, title, message, type)
      VALUES (?, 'Reservation Submitted', ?, 'info')
    `, [userId, `Your reservation request for "${book.title}" was placed (Queue Position #${queuePosition}).`]);

    return res.status(201).json({
      success: true,
      message: `Reservation request for "${book.title}" placed successfully!`,
      bookingId: result.insertId,
      queue_position: queuePosition
    });
  } catch (err) {
    console.error('createBooking error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create booking.', error: err.message });
  }
};

// PUT /api/bookings/:id
const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const validStatuses = ['Pending', 'Approved', 'Reserved', 'Cancelled', 'Completed'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status. Must be one of [${validStatuses.join(', ')}].` });
    }

    const bookings = await query(`
      SELECT bk.*, b.title as book_title, u.name as student_name, u.id as user_id
      FROM bookings bk
      JOIN books b ON bk.book_id = b.id
      JOIN users u ON bk.user_id = u.id
      WHERE bk.id = ?
    `, [id]);

    if (bookings.length === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    const booking = bookings[0];

    await query(`UPDATE bookings SET status = ?, notes = ? WHERE id = ?`, [status, notes || booking.notes, id]);

    // Send notification to user
    await query(`
      INSERT INTO notifications (user_id, title, message, type)
      VALUES (?, ?, ?, ?)
    `, [
      booking.user_id,
      `Reservation ${status}`,
      `Your reservation for "${booking.book_title}" has been marked as ${status}.`,
      status === 'Approved' || status === 'Reserved' ? 'success' : status === 'Cancelled' ? 'danger' : 'info'
    ]);

    return res.json({ success: true, message: `Booking status updated to "${status}".` });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update booking status.', error: err.message });
  }
};

// DELETE /api/bookings/:id
const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    
    const bookings = await query(`
      SELECT bk.*, b.title as book_title
      FROM bookings bk
      JOIN books b ON bk.book_id = b.id
      WHERE bk.id = ?
    `, [id]);

    if (bookings.length === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    const booking = bookings[0];

    // Verify user authorization: student can only cancel own booking, admin can cancel any
    if (req.user.role !== 'admin' && booking.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized to cancel this booking.' });
    }

    await query(`UPDATE bookings SET status = 'Cancelled' WHERE id = ?`, [id]);

    return res.json({ success: true, message: `Reservation for "${booking.book_title}" has been cancelled.` });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to cancel booking.', error: err.message });
  }
};

module.exports = {
  getAllBookings,
  createBooking,
  updateBookingStatus,
  cancelBooking
};
