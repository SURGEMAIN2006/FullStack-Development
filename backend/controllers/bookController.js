const { query } = require('../config/db');

// GET /api/books
const getAllBooks = async (req, res) => {
  try {
    const { search, category, availability, sort = 'newest' } = req.query;

    let sql = `
      SELECT b.*, c.name as category_name, c.icon as category_icon
      FROM books b
      LEFT JOIN categories c ON b.category_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      sql += ` AND (b.title LIKE ? OR b.author LIKE ? OR b.isbn LIKE ? OR c.name LIKE ? OR b.publisher LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term, term, term);
    }

    if (category && category !== 'all') {
      sql += ` AND b.category_id = ?`;
      params.push(category);
    }

    if (availability === 'available') {
      sql += ` AND b.available_copies > 0`;
    } else if (availability === 'unavailable') {
      sql += ` AND b.available_copies = 0`;
    }

    if (sort === 'title') {
      sql += ` ORDER BY b.title ASC`;
    } else if (sort === 'author') {
      sql += ` ORDER BY b.author ASC`;
    } else if (sort === 'popular') {
      sql += ` ORDER BY b.total_copies DESC`;
    } else {
      sql += ` ORDER BY b.created_at DESC`;
    }

    const books = await query(sql, params);
    return res.json({ success: true, count: books.length, books });
  } catch (err) {
    console.error('getAllBooks error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch books.', error: err.message });
  }
};

// GET /api/books/:id
const getBookById = async (req, res) => {
  try {
    const { id } = req.params;
    const books = await query(`
      SELECT b.*, c.name as category_name, c.icon as category_icon
      FROM books b
      LEFT JOIN categories c ON b.category_id = c.id
      WHERE b.id = ?
    `, [id]);

    if (books.length === 0) {
      return res.status(404).json({ success: false, message: 'Book not found.' });
    }

    const book = books[0];

    // Fetch active issues for this book
    const activeIssues = await query(`
      SELECT bi.*, u.name as user_name, u.email as user_email
      FROM book_issues bi
      JOIN users u ON bi.user_id = u.id
      WHERE bi.book_id = ? AND bi.status IN ('Issued', 'Overdue')
    `, [id]);

    // Fetch active reservations
    const reservations = await query(`
      SELECT bk.*, u.name as user_name, u.email as user_email
      FROM bookings bk
      JOIN users u ON bk.user_id = u.id
      WHERE bk.book_id = ? AND bk.status IN ('Pending', 'Approved', 'Reserved')
      ORDER BY bk.queue_position ASC
    `, [id]);

    return res.json({
      success: true,
      book,
      activeIssues,
      reservations
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error fetching book details.', error: err.message });
  }
};

// POST /api/books
const createBook = async (req, res) => {
  try {
    const {
      title, author, isbn, category_id, publisher, publication_year,
      description, total_copies = 1, cover_image, location_rack = 'Rack A-1'
    } = req.body;

    if (!title || !author || !isbn || !category_id) {
      return res.status(400).json({ success: false, message: 'Title, Author, ISBN, and Category are required.' });
    }

    // Check duplicate ISBN
    const existing = await query('SELECT id FROM books WHERE isbn = ?', [isbn]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'A book with this ISBN already exists.' });
    }

    const bookCode = `BK-${Math.floor(1000 + Math.random() * 9000)}`;
    const total = parseInt(total_copies) || 1;
    const defaultCover = cover_image || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400';

    const result = await query(`
      INSERT INTO books (book_code, title, author, isbn, category_id, publisher, publication_year, description, total_copies, available_copies, cover_image, location_rack)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [bookCode, title, author, isbn, category_id, publisher || null, publication_year || null, description || null, total, total, defaultCover, location_rack]);

    const newBookId = result.insertId;
    return res.status(201).json({
      success: true,
      message: 'Book created successfully.',
      bookId: newBookId
    });
  } catch (err) {
    console.error('createBook error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create book.', error: err.message });
  }
};

// PUT /api/books/:id
const updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title, author, isbn, category_id, publisher, publication_year,
      description, total_copies, available_copies, cover_image, location_rack
    } = req.body;

    const existing = await query('SELECT * FROM books WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Book not found.' });
    }

    const currentBook = existing[0];

    // If total_copies is updated, calculate available copy delta
    let newTotal = total_copies !== undefined ? parseInt(total_copies) : currentBook.total_copies;
    let newAvailable = available_copies !== undefined ? parseInt(available_copies) : currentBook.available_copies;

    if (total_copies !== undefined && available_copies === undefined) {
      const diff = newTotal - currentBook.total_copies;
      newAvailable = Math.max(0, currentBook.available_copies + diff);
    }

    await query(`
      UPDATE books SET
        title = ?,
        author = ?,
        isbn = ?,
        category_id = ?,
        publisher = ?,
        publication_year = ?,
        description = ?,
        total_copies = ?,
        available_copies = ?,
        cover_image = ?,
        location_rack = ?
      WHERE id = ?
    `, [
      title || currentBook.title,
      author || currentBook.author,
      isbn || currentBook.isbn,
      category_id || currentBook.category_id,
      publisher !== undefined ? publisher : currentBook.publisher,
      publication_year !== undefined ? publication_year : currentBook.publication_year,
      description !== undefined ? description : currentBook.description,
      newTotal,
      newAvailable,
      cover_image || currentBook.cover_image,
      location_rack || currentBook.location_rack,
      id
    ]);

    return res.json({ success: true, message: 'Book updated successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update book.', error: err.message });
  }
};

// DELETE /api/books/:id
const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if book has active issues
    const activeIssues = await query(`SELECT id FROM book_issues WHERE book_id = ? AND status IN ('Issued', 'Overdue')`, [id]);
    if (activeIssues.length > 0) {
      return res.status(400).json({ success: false, message: 'Cannot delete book with active issued copies.' });
    }

    await query('DELETE FROM books WHERE id = ?', [id]);
    return res.json({ success: true, message: 'Book deleted successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete book.', error: err.message });
  }
};

module.exports = {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook
};
