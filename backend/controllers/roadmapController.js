const Roadmap = require('../models/Roadmap');
const User = require('../models/User');
const { generateCareerRoadmap } = require('../services/geminiService');

const generateRoadmap = async (req, res) => {
  const { targetRole, currentYear } = req.body;

  try {
    if (!targetRole) {
      return res.status(400).json({ message: 'Target role is required' });
    }

    // Load user and skills
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const currentSkills = user.skills || [];
    const yearOfStudy = currentYear || user.year || '3rd Year';

    // Generate roadmap using Gemini API
    const roadmapData = await generateCareerRoadmap(currentSkills, targetRole, yearOfStudy);

    // Save report to DB
    const newRoadmap = await Roadmap.create({
      user: req.user._id,
      targetRole,
      skills: currentSkills,
      currentYear: yearOfStudy,
      timeline: roadmapData.timeline,
    });

    res.status(201).json(newRoadmap);
  } catch (error) {
    console.error('Roadmap controller error:', error);
    res.status(500).json({ message: error.message || 'Failed to generate roadmap' });
  }
};

module.exports = {
  generateRoadmap,
};
