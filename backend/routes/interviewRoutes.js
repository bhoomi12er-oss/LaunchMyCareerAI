const express = require('express');
const {
  generateQuestions,
  evaluateSession,
  getInterviewHistory,
} = require('../controllers/interviewController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/history', protect, getInterviewHistory);
router.post('/generate', protect, generateQuestions);
router.post('/:sessionId/evaluate', protect, evaluateSession);

module.exports = router;
