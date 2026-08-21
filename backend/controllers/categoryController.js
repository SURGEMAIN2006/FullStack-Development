const { query } = require('../config/db');

// GET /api/categories
const getAllCategories = async (req, res) => {
  try {
    const categories = await query(`
      SELECT c.*, COUNT(b.id) as book_count
      FROM categories c
      LEFT JOIN books b ON c.id = b.category_id
      GROUP BY c.id
      ORDER BY c.name ASC
    `);

    return res.json({ success: true, categories });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch categories.', error: err.message });
  }
};

// POST /api/categories
const createCategory = async (req, res) => {
  try {
    const { name, description, icon = 'BookOpen' } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Category name is required.' });
    }

    const existing = await query('SELECT id FROM categories WHERE name = ?', [name]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Category already exists.' });
    }

    const result = await query(
      `INSERT INTO categories (name, description, icon) VALUES (?, ?, ?)`,
      [name, description || null, icon]
    );

    return res.status(201).json({
      success: true,
      message: 'Category created.',
      categoryId: result.insertId
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to create category.', error: err.message });
  }
};

// DELETE /api/categories/:id
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM categories WHERE id = ?', [id]);
    return res.json({ success: true, message: 'Category deleted.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete category.', error: err.message });
  }
};

module.exports = {
  getAllCategories,
  createCategory,
  deleteCategory
};
