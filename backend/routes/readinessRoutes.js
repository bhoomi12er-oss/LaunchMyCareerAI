const express = require('express');
const { getReadinessScore, calculateReadinessScore } = require('../controllers/readinessController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .get(protect, getReadinessScore)
  .post(protect, calculateReadinessScore);

module.exports = router;
