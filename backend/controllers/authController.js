const { query } = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, role = 'student', phone, student_id, department } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required fields.' });
    }

    // Check duplicate
    const existing = await query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'An account with this email address already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userCode = `USR-${Math.floor(100 + Math.random() * 900)}`;
    const avatarUrl = `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150`;

    const result = await query(
      `INSERT INTO users (user_code, name, email, password_hash, role, phone, student_id, department, avatar_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userCode, name, email, hashedPassword, role, phone || null, student_id || null, department || null, avatarUrl]
    );

    const userId = result.insertId;
    const token = jwt.sign({ id: userId, email, role, name, user_code: userCode }, JWT_SECRET, { expiresIn: '7d' });

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: {
        id: userId,
        user_code: userCode,
        name,
        email,
        role,
        phone,
        student_id,
        department,
        avatar_url: avatarUrl
      }
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ success: false, message: 'Server error during registration.', error: err.message });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const users = await query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name, user_code: user.user_code },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password_hash, ...userProfile } = user;

    return res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: userProfile
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Server error during login.', error: err.message });
  }
};

// GET /api/auth/me
const me = async (req, res) => {
  try {
    const users = await query('SELECT id, user_code, name, email, role, phone, student_id, department, avatar_url, created_at FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    return res.json({ success: true, user: users[0] });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch user profile.', error: err.message });
  }
};

module.exports = {
  register,
  login,
  me
};
