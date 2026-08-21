const express = require('express');
const router = express.Router();
const { getAllBooks, getBookById, createBook, updateBook, deleteBook } = require('../controllers/bookController');
const { verifyToken, verifyRole } = require('../middleware/auth');

router.get('/', getAllBooks);
router.get('/:id', getBookById);
router.post('/', verifyToken, verifyRole(['admin']), createBook);
router.put('/:id', verifyToken, verifyRole(['admin']), updateBook);
router.delete('/:id', verifyToken, verifyRole(['admin']), deleteBook);

module.exports = router;
