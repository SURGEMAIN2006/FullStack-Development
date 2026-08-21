const express = require('express');
const router = express.Router();
const { getAllIssues, createIssue, returnBook, getOverdue } = require('../controllers/issueController');
const { verifyToken, verifyRole } = require('../middleware/auth');

router.get('/', verifyToken, getAllIssues);
router.get('/overdue', verifyToken, getOverdue);
router.post('/', verifyToken, verifyRole(['admin']), createIssue);
router.put('/:id/return', verifyToken, verifyRole(['admin']), returnBook);

module.exports = router;
