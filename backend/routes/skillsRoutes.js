const express = require('express');
const { analyzeSkills } = require('../controllers/skillsController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/analyze', protect, analyzeSkills);

module.exports = router;
