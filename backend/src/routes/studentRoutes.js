const express = require('express');
const { protect } = require('../middleware/auth');

const { getAllBadges } = require('../controllers/badgeController');
const { getLeaderboard } = require('../controllers/leaderboardController');
const { logSession, getStats } = require('../controllers/timerController');
const { getNotes, createNote, updateNote, deleteNote } = require('../controllers/noteController');
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} = require('../controllers/wishlistController');

const router = express.Router();

router.use(protect);

// Badges & Achievements
router.get('/badges', getAllBadges);

// Leaderboard
router.get('/leaderboard', getLeaderboard);

// Study Timer / Pomodoro
router.post('/timer/session', logSession);
router.get('/timer/stats', getStats);

// Notes
router.get('/notes', getNotes);
router.post('/notes', createNote);
router.put('/notes/:id', updateNote);
router.delete('/notes/:id', deleteNote);

// Wishlist
router.get('/wishlist', getWishlist);
router.post('/wishlist', addToWishlist);
router.delete('/wishlist/:id', removeFromWishlist);

module.exports = router;
