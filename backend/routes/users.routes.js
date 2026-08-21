const express = require('express');
const router = express.Router();
const { getAllUsers, getUserById, createUser, updateUser, deleteUser } = require('../controllers/userController');
const { verifyToken, verifyRole } = require('../middleware/auth');

router.get('/', verifyToken, getAllUsers);
router.get('/:id', verifyToken, getUserById);
router.post('/', verifyToken, verifyRole(['admin']), createUser);
router.put('/:id', verifyToken, verifyRole(['admin']), updateUser);
router.delete('/:id', verifyToken, verifyRole(['admin']), deleteUser);

module.exports = router;
