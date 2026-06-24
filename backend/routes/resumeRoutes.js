const express = require('express');
const multer = require('multer');
const { analyzeResume, getResumeAnalyses } = require('../controllers/resumeController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Configure multer in-memory storage (file buffer in memory)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

router.get('/analyses', protect, getResumeAnalyses);
router.post('/analyze', protect, upload.single('resume'), analyzeResume);

module.exports = router;
