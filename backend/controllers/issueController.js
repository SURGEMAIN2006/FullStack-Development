const { query } = require('../config/db');

// Keep DATE values independent of the server's timezone.
const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const dateOnly = (value) => {
  if (value instanceof Date) return formatDate(value);
  return String(value).slice(0, 10);
};

const daysBetween = (from, to) => {
  const [fromYear, fromMonth, fromDay] = dateOnly(from).split('-').map(Number);
  const [toYear, toMonth, toDay] = dateOnly(to).split('-').map(Number);
  const fromUtc = Date.UTC(fromYear, fromMonth - 1, fromDay);
  const toUtc = Date.UTC(toYear, toMonth - 1, toDay);
  return Math.max(0, Math.floor((toUtc - fromUtc) / 86400000));
};

// GET /api/issues
const getAllIssues = async (req, res) => {
  try {
    const { search, status, user_id } = req.query;

    let sql = `
      SELECT bi.*, 
             u.name as student_name, u.email as student_email, u.student_id, u.department, u.phone as student_phone,
             b.title as book_title, b.author as book_author, b.isbn, b.cover_image, b.book_code
      FROM book_issues bi
      JOIN users u ON bi.user_id = u.id
      JOIN books b ON bi.book_id = b.id
      WHERE 1=1
    `;
    const params = [];

    if (user_id) {
      sql += ` AND bi.user_id = ?`;
      params.push(user_id);
    }

    if (search) {
      sql += ` AND (u.name LIKE ? OR u.email LIKE ? OR u.student_id LIKE ? OR b.title LIKE ? OR b.isbn LIKE ? OR bi.issue_code LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term, term, term, term);
    }

    if (status && status !== 'all') {
      sql += ` AND bi.status = ?`;
      params.push(status);
    }

    sql += ` ORDER BY bi.created_at DESC`;

    const issues = await query(sql, params);

    // Compute overdue days dynamically
    const today = formatDate(new Date());
    const processed = issues.map(item => {
      const isOverdue = ['Issued', 'Overdue'].includes(item.status) && dateOnly(item.due_date) < today;
      const overdueDays = isOverdue ? daysBetween(item.due_date, today) : 0;

      return {
        ...item,
        overdue_days: overdueDays,
        status: isOverdue ? 'Overdue' : item.status
      };
    });

    return res.json({ success: true, count: processed.length, issues: processed });
  } catch (err) {
    console.error('getAllIssues error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch issue records.', error: err.message });
  }
};

// POST /api/issues
const createIssue = async (req, res) => {
  try {
    const { user_id, book_id, issue_date, due_date, notes } = req.body;

    if (!user_id || !book_id || !due_date) {
      return res.status(400).json({ success: false, message: 'User, Book, and Due Date are required.' });
    }

    // 1. Verify user exists
    const users = await query('SELECT name, email FROM users WHERE id = ?', [user_id]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'Student/User not found.' });
    }
    const studentName = users[0].name;

    // 2. Verify book availability
    const books = await query('SELECT title, available_copies, total_copies FROM books WHERE id = ?', [book_id]);
    if (books.length === 0) {
      return res.status(404).json({ success: false, message: 'Book not found.' });
    }

    const book = books[0];
    if (book.available_copies <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot issue book "${book.title}". All copies are currently issued or reserved.` 
      });
    }

    // 3. Issue record logic
    const issueCode = `ISS-${Math.floor(1000 + Math.random() * 9000)}`;
    const issDate = issue_date || formatDate(new Date());

    const result = await query(`
      INSERT INTO book_issues (issue_code, user_id, book_id, issue_date, due_date, status, notes)
      VALUES (?, ?, ?, ?, ?, 'Issued', ?)
    `, [issueCode, user_id, book_id, issDate, due_date, notes || null]);

    // 4. Decrease available copies
    await query(`UPDATE books SET available_copies = available_copies - 1 WHERE id = ?`, [book_id]);

    // 5. Check if user had an active reservation for this book and complete it
    await query(`
      UPDATE bookings SET status = 'Completed' 
      WHERE user_id = ? AND book_id = ? AND status IN ('Pending', 'Approved', 'Reserved')
    `, [user_id, book_id]);

    // 6. Create notification for student
    await query(`
      INSERT INTO notifications (user_id, title, message, type)
      VALUES (?, 'Book Issued', ?, 'success')
    `, [user_id, `You have been issued "${book.title}". Due date: ${due_date}.`]);

    return res.status(201).json({
      success: true,
      message: `Book "${book.title}" issued to ${studentName} successfully.`,
      issueId: result.insertId
    });
  } catch (err) {
    console.error('createIssue error:', err);
    return res.status(500).json({ success: false, message: 'Failed to issue book.', error: err.message });
  }
};

// PUT /api/issues/:id/return
const returnBook = async (req, res) => {
  try {
    const { id } = req.params;
    const { return_date, fine_amount = 0, notes } = req.body;

    const issues = await query(`
      SELECT bi.*, b.title as book_title, b.id as book_id, u.name as user_name
      FROM book_issues bi
      JOIN books b ON bi.book_id = b.id
      JOIN users u ON bi.user_id = u.id
      WHERE bi.id = ?
    `, [id]);

    if (issues.length === 0) {
      return res.status(404).json({ success: false, message: 'Issue record not found.' });
    }

    const issue = issues[0];
    if (issue.status === 'Returned') {
      return res.status(400).json({ success: false, message: 'This book has already been returned.' });
    }

    const retDate = return_date || formatDate(new Date());
    const today = formatDate(new Date());
    if (!/^\d{4}-\d{2}-\d{2}$/.test(retDate) || retDate > today || retDate < dateOnly(issue.issue_date)) {
      return res.status(400).json({ success: false, message: 'Return date must be a valid date between the issue date and today.' });
    }

    // Calculate overdue fine if not provided
    let calculatedFine = parseFloat(fine_amount) || 0;
    if (retDate > dateOnly(issue.due_date) && calculatedFine === 0) {
      const diffDays = daysBetween(issue.due_date, retDate);
      calculatedFine = diffDays * 2.00; // $2 per day overdue fine
    }

    // 1. Update issue record
    const result = await query(`
      UPDATE book_issues SET
        return_date = ?,
        status = 'Returned',
        fine_amount = ?,
        notes = ?
      WHERE id = ? AND status IN ('Issued', 'Overdue') AND return_date IS NULL
    `, [retDate, calculatedFine, notes || issue.notes, id]);

    if (result.affectedRows === 0) {
      return res.status(409).json({ success: false, message: 'This book has already been returned.' });
    }

    // 2. Increase available copies
    await query(`UPDATE books SET available_copies = LEAST(total_copies, available_copies + 1) WHERE id = ?`, [issue.book_id]);

    // 3. Queue Check: Is there a pending/approved reservation for this book?
    const reservations = await query(`
      SELECT bk.*, u.name as user_name, u.email as user_email
      FROM bookings bk
      JOIN users u ON bk.user_id = u.id
      WHERE bk.book_id = ? AND bk.status IN ('Pending', 'Approved')
      ORDER BY bk.queue_position ASC, bk.created_at ASC
    `, [issue.book_id]);

    if (reservations.length > 0) {
      const nextBooking = reservations[0];
      // Notify next student that the book is ready
      await query(`
        INSERT INTO notifications (user_id, title, message, type)
        VALUES (?, 'Reserved Book Available', ?, 'info')
      `, [nextBooking.user_id, `The book "${issue.book_title}" you reserved is now available at the library desk!`]);

      // Mark reservation as Reserved (held for pickup)
      await query(`UPDATE bookings SET status = 'Reserved' WHERE id = ?`, [nextBooking.id]);
    }

    // 4. Create notification for return user
    await query(`
      INSERT INTO notifications (user_id, title, message, type)
      VALUES (?, 'Book Returned Successfully', ?, 'success')
    `, [issue.user_id, `Thank you for returning "${issue.book_title}".`]);

    return res.json({
      success: true,
      message: 'Book returned successfully.',
      fine_amount: calculatedFine
    });
  } catch (err) {
    console.error('returnBook error:', err);
    return res.status(500).json({ success: false, message: 'Failed to process book return.', error: err.message });
  }
};

// GET /api/issues/overdue
const getOverdue = async (req, res) => {
  try {
    const today = formatDate(new Date());
    const overdues = await query(`
      SELECT bi.*, 
             u.name as student_name, u.email as student_email, u.student_id, u.department, u.phone as student_phone,
             b.title as book_title, b.author as book_author, b.isbn, b.cover_image, b.book_code
      FROM book_issues bi
      JOIN users u ON bi.user_id = u.id
      JOIN books b ON bi.book_id = b.id
      WHERE bi.status IN ('Issued', 'Overdue') AND bi.return_date IS NULL AND bi.due_date < ?
      ORDER BY bi.due_date ASC
    `, [today]);

    const result = overdues.map(item => {
      const overdueDays = daysBetween(item.due_date, today);
      return {
        ...item,
        overdue_days: overdueDays,
        status: 'Overdue'
      };
    });

    return res.json({ success: true, count: result.length, overdues: result });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch overdue books.', error: err.message });
  }
};

module.exports = {
  getAllIssues,
  createIssue,
  returnBook,
  getOverdue
};
