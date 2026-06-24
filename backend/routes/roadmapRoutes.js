const express = require('express');
const { generateRoadmap } = require('../controllers/roadmapController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/generate', protect, generateRoadmap);

module.exports = router;
