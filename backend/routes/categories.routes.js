const express = require('express');
const router = express.Router();
const { getAllCategories, createCategory, deleteCategory } = require('../controllers/categoryController');
const { verifyToken, verifyRole } = require('../middleware/auth');

router.get('/', getAllCategories);
router.post('/', verifyToken, verifyRole(['admin']), createCategory);
router.delete('/:id', verifyToken, verifyRole(['admin']), deleteCategory);

module.exports = router;
