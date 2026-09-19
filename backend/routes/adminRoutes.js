const express = require('express');
const router = express.Router();
const { getStats, getAllUsers, updateUserRole, toggleBanUser } = require('../controllers/adminController');
const { protect, facultyOrAdmin, adminOnly } = require('../middleware/auth');

router.get('/stats', protect, facultyOrAdmin, getStats);
router.get('/users', protect, adminOnly, getAllUsers);
router.put('/users/:id/role', protect, adminOnly, updateUserRole);
router.put('/users/:id/ban', protect, adminOnly, toggleBanUser);

module.exports = router;
