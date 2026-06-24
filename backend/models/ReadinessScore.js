const mongoose = require('mongoose');

const readinessScoreSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    dsaProgress: {
      type: Number,
      default: 0,
    },
    projectsCount: {
      type: Number,
      default: 0,
    },
    gitHubCommits: {
      type: Number,
      default: 0,
    },
    resumeScore: {
      type: Number,
      default: 0,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    breakdown: {
      dsaScore: { type: Number, default: 0 },
      projectsScore: { type: Number, default: 0 },
      skillsScore: { type: Number, default: 0 },
      resumeScore: { type: Number, default: 0 },
      githubScore: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ReadinessScore', readinessScoreSchema);
