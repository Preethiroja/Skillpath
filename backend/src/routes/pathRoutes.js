const express = require('express');
const {
  createCareerGoal,
  getCareerGoals,
  generatePath,
  getPaths,
  getPathById,
  toggleNodeStatus,
} = require('../controllers/pathController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/goal', createCareerGoal);
router.get('/goals', getCareerGoals);

router.post('/generate', generatePath);
router.get('/', getPaths);
router.get('/:id', getPathById);
router.put('/:id/node/:nodeId', toggleNodeStatus);

module.exports = router;
