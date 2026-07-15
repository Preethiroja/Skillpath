const express = require('express');
const {
  register,
  login,
  refresh,
  logout,
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/refresh', refresh);

// Protected routes
router.use(protect);
router.post('/logout', logout);
router.route('/profile')
  .get(getProfile)
  .put(updateProfile);
router.put('/change-password', changePassword);
router.delete('/delete-account', deleteAccount);

module.exports = router;
