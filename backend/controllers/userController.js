const User = require('../models/User');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        college: user.college,
        branch: user.branch,
        year: user.year,
        cgpa: user.cgpa,
        skills: user.skills,
        github: user.github,
        linkedin: user.linkedin,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      
      // Profile fields
      user.college = req.body.college !== undefined ? req.body.college : user.college;
      user.branch = req.body.branch !== undefined ? req.body.branch : user.branch;
      user.year = req.body.year !== undefined ? req.body.year : user.year;
      user.cgpa = req.body.cgpa !== undefined ? req.body.cgpa : user.cgpa;
      user.github = req.body.github !== undefined ? req.body.github : user.github;
      user.linkedin = req.body.linkedin !== undefined ? req.body.linkedin : user.linkedin;

      // Handle skills array/comma-separated conversion
      if (req.body.skills !== undefined) {
        if (Array.isArray(req.body.skills)) {
          user.skills = req.body.skills;
        } else if (typeof req.body.skills === 'string') {
          user.skills = req.body.skills
            .split(',')
            .map((skill) => skill.trim())
            .filter((skill) => skill !== '');
        }
      }

      // If updating password
      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        college: updatedUser.college,
        branch: updatedUser.branch,
        year: updatedUser.year,
        cgpa: updatedUser.cgpa,
        skills: updatedUser.skills,
        github: updatedUser.github,
        linkedin: updatedUser.linkedin,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
};
