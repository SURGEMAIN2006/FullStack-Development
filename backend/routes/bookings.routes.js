const express = require('express');
const router = express.Router();
const { getAllBookings, createBooking, updateBookingStatus, cancelBooking } = require('../controllers/bookingController');
const { verifyToken, verifyRole } = require('../middleware/auth');

router.get('/', verifyToken, getAllBookings);
router.post('/', verifyToken, createBooking);
router.put('/:id', verifyToken, verifyRole(['admin']), updateBookingStatus);
router.delete('/:id', verifyToken, cancelBooking);

module.exports = router;
