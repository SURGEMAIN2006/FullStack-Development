const { query } = require('../config/db');
const bcrypt = require('bcryptjs');

// GET /api/users
const getAllUsers = async (req, res) => {
  try {
    const { search, role, department } = req.query;

    let sql = `
      SELECT u.id, u.user_code, u.name, u.email, u.role, u.phone, u.student_id, u.department, u.avatar_url, u.created_at,
             COUNT(DISTINCT bi.id) as total_issued,
             SUM(CASE WHEN bi.status IN ('Issued', 'Overdue') THEN 1 ELSE 0 END) as active_issues
      FROM users u
      LEFT JOIN book_issues bi ON u.id = bi.user_id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      sql += ` AND (u.name LIKE ? OR u.email LIKE ? OR u.student_id LIKE ? OR u.department LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    if (role && role !== 'all') {
      sql += ` AND u.role = ?`;
      params.push(role);
    }

    if (department && department !== 'all') {
      sql += ` AND u.department = ?`;
      params.push(department);
    }

    sql += ` GROUP BY u.id ORDER BY u.created_at DESC`;

    const users = await query(sql, params);
    return res.json({ success: true, count: users.length, users });
  } catch (err) {
    console.error('getAllUsers error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch users.', error: err.message });
  }
};

// GET /api/users/:id
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const users = await query(
      `SELECT id, user_code, name, email, role, phone, student_id, department, avatar_url, created_at FROM users WHERE id = ?`,
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const user = users[0];

    // Fetch borrowing history
    const issues = await query(`
      SELECT bi.*, b.title as book_title, b.author as book_author, b.cover_image, b.isbn
      FROM book_issues bi
      JOIN books b ON bi.book_id = b.id
      WHERE bi.user_id = ?
      ORDER BY bi.created_at DESC
    `, [id]);

    // Fetch active bookings
    const bookings = await query(`
      SELECT bk.*, b.title as book_title, b.author as book_author, b.cover_image
      FROM bookings bk
      JOIN books b ON bk.book_id = b.id
      WHERE bk.user_id = ?
      ORDER BY bk.created_at DESC
    `, [id]);

    return res.json({
      success: true,
      user,
      issues,
      bookings
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error fetching user details.', error: err.message });
  }
};

// POST /api/users
const createUser = async (req, res) => {
  try {
    const { name, email, password = 'student123', role = 'student', phone, student_id, department } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required.' });
    }

    const existing = await query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'User with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userCode = `USR-${Math.floor(100 + Math.random() * 900)}`;
    const avatarUrl = `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150`;

    const result = await query(
      `INSERT INTO users (user_code, name, email, password_hash, role, phone, student_id, department, avatar_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userCode, name, email, hashedPassword, role, phone || null, student_id || null, department || null, avatarUrl]
    );

    return res.status(201).json({
      success: true,
      message: 'User created successfully.',
      userId: result.insertId
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to create user.', error: err.message });
  }
};

// PUT /api/users/:id
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, phone, student_id, department, password } = req.body;

    const existing = await query('SELECT * FROM users WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const currentUser = existing[0];
    let passwordHash = currentUser.password_hash;
    if (password) {
      passwordHash = await bcrypt.hash(password, 10);
    }

    await query(`
      UPDATE users SET
        name = ?,
        email = ?,
        role = ?,
        phone = ?,
        student_id = ?,
        department = ?,
        password_hash = ?
      WHERE id = ?
    `, [
      name || currentUser.name,
      email || currentUser.email,
      role || currentUser.role,
      phone !== undefined ? phone : currentUser.phone,
      student_id !== undefined ? student_id : currentUser.student_id,
      department !== undefined ? department : currentUser.department,
      passwordHash,
      id
    ]);

    return res.json({ success: true, message: 'User updated successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update user.', error: err.message });
  }
};

// DELETE /api/users/:id
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user has active issued books
    const active = await query(`SELECT id FROM book_issues WHERE user_id = ? AND status IN ('Issued', 'Overdue')`, [id]);
    if (active.length > 0) {
      return res.status(400).json({ success: false, message: 'Cannot delete user with currently issued books.' });
    }

    await query('DELETE FROM users WHERE id = ?', [id]);
    return res.json({ success: true, message: 'User deleted successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete user.', error: err.message });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};
