const SkillAnalysis = require('../models/SkillAnalysis');
const User = require('../models/User');
const { analyzeSkillGap } = require('../services/geminiService');

const analyzeSkills = async (req, res) => {
  const { targetRole } = req.body;

  try {
    if (!targetRole) {
      return res.status(400).json({ message: 'Target role is required' });
    }

    // Retrieve user and their current skills
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User profile not found' });
    }

    const currentSkills = user.skills || [];

    // Trigger Gemini Skill Gap evaluation
    const analysis = await analyzeSkillGap(currentSkills, targetRole);

    // Save record in Database
    const newAnalysis = await SkillAnalysis.create({
      user: req.user._id,
      targetRole,
      strengths: analysis.strengths,
      missingSkills: analysis.missingSkills,
      suggestions: analysis.suggestions,
    });

    res.status(201).json(newAnalysis);
  } catch (error) {
    console.error('Skills analysis controller error:', error);
    res.status(500).json({ message: error.message || 'Failed to analyze skills' });
  }
};

module.exports = {
  analyzeSkills,
};
