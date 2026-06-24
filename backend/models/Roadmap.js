const mongoose = require('mongoose');

const roadmapSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    targetRole: {
      type: String,
      required: true,
    },
    skills: {
      type: [String],
      default: [],
    },
    currentYear: {
      type: String,
      default: '',
    },
    timeline: [
      {
        month: { type: String, required: true },
        topics: { type: [String], default: [] },
        resources: { type: [String], default: [] },
        milestone: { type: String, default: '' },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Roadmap', roadmapSchema);
