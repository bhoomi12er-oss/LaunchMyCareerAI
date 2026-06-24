const ReadinessScore = require('../models/ReadinessScore');
const ResumeAnalysis = require('../models/ResumeAnalysis');
const User = require('../models/User');

// @desc    Calculate and save new placement readiness score
// @route   POST /api/readiness
// @access  Private
const calculateReadinessScore = async (req, res) => {
  const { dsaProgress = 0, projectsCount = 0, gitHubCommits = 0 } = req.body;

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get latest resume score
    const latestResume = await ResumeAnalysis.findOne({ user: req.user._id }).sort({ createdAt: -1 });
    const resumeAtsScore = latestResume ? latestResume.atsScore : 0;

    // Calculate sub-scores
    const skillsCount = user.skills ? user.skills.length : 0;

    // Weights:
    // 1. DSA Progress: max 30 pts (e.g. 200 questions solved = 30 pts)
    const dsaScore = Math.min(Math.round((dsaProgress / 200) * 30), 30);

    // 2. Projects count: max 25 pts (e.g. 3 projects = 25 pts)
    const projectsScore = Math.min(Math.round((projectsCount / 3) * 25), 25);

    // 3. Skills count: max 15 pts (e.g. 8 skills = 15 pts)
    const skillsScore = Math.min(Math.round((skillsCount / 8) * 15), 15);

    // 4. Resume Score (ATS): max 20 pts (e.g. 100 ATS = 20 pts)
    const resumeScore = Math.round((resumeAtsScore / 100) * 20);

    // 5. GitHub Activity: max 10 pts (e.g. 100 commits = 10 pts)
    const githubScore = Math.min(Math.round((gitHubCommits / 100) * 10), 10);

    // Final Score out of 100
    const totalScore = dsaScore + projectsScore + skillsScore + resumeScore + githubScore;

    // Save score metrics
    const readiness = await ReadinessScore.create({
      user: req.user._id,
      dsaProgress,
      projectsCount,
      gitHubCommits,
      resumeScore: resumeAtsScore,
      score: totalScore,
      breakdown: {
        dsaScore,
        projectsScore,
        skillsScore,
        resumeScore,
        githubScore,
      },
    });

    res.status(201).json(readiness);
  } catch (error) {
    console.error('Readiness score calculation error:', error);
    res.status(500).json({ message: error.message || 'Failed to calculate readiness score' });
  }
};

// @desc    Get user readiness history and latest metrics
// @route   GET /api/readiness
// @access  Private
const getReadinessScore = async (req, res) => {
  try {
    const scores = await ReadinessScore.find({ user: req.user._id }).sort({ createdAt: -1 });
    
    // If no score has been recorded yet, create a default 0-score baseline
    if (scores.length === 0) {
      const user = await User.findById(req.user._id);
      const skillsCount = user?.skills ? user.skills.length : 0;
      const skillsScore = Math.min(Math.round((skillsCount / 8) * 15), 15);

      const defaultBaseline = {
        dsaProgress: 0,
        projectsCount: 0,
        gitHubCommits: 0,
        resumeScore: 0,
        score: skillsScore, // Starts with basic skills points
        breakdown: {
          dsaScore: 0,
          projectsScore: 0,
          skillsScore,
          resumeScore: 0,
          githubScore: 0,
        },
        createdAt: new Date(),
      };
      return res.json({ latest: defaultBaseline, history: [] });
    }

    res.json({
      latest: scores[0],
      history: scores.slice(0, 10), // Return last 10 records for history chart
    });
  } catch (error) {
    console.error('Get readiness score error:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch readiness score' });
  }
};

module.exports = {
  calculateReadinessScore,
  getReadinessScore,
};
