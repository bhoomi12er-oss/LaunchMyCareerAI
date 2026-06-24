const InterviewSession = require('../models/InterviewSession');
const {
  generateInterviewQuestions,
  evaluateInterviewAnswers,
} = require('../services/geminiService');

const allowedRoles = [
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'SDE',
  'Data Analyst',
  'AI/ML Engineer',
  'Product Manager',
];

const allowedTypes = ['HR', 'Technical', 'DSA', 'Project Discussion'];
const allowedDifficulties = ['Easy', 'Medium', 'Hard'];

const generateQuestions = async (req, res) => {
  const { role, type, difficulty, questionCount = 5 } = req.body;

  try {
    if (!role || !type || !difficulty) {
      return res.status(400).json({ message: 'Role, interview type, and difficulty are required' });
    }

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role selected' });
    }

    if (!allowedTypes.includes(type)) {
      return res.status(400).json({ message: 'Invalid interview type selected' });
    }

    if (!allowedDifficulties.includes(difficulty)) {
      return res.status(400).json({ message: 'Invalid difficulty selected' });
    }

    const count = Math.min(Math.max(Number(questionCount) || 5, 5), 10);
    const questionData = await generateInterviewQuestions(role, type, difficulty, count);

    const session = await InterviewSession.create({
      user: req.user._id,
      role,
      type,
      difficulty,
      questions: questionData.questions,
      status: 'generated',
    });

    res.status(201).json(session);
  } catch (error) {
    console.error('Interview question generation error:', error);
    res.status(500).json({ message: error.message || 'Failed to generate interview questions' });
  }
};

const evaluateSession = async (req, res) => {
  const { sessionId } = req.params;
  const { answers } = req.body;

  try {
    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ message: 'Please submit at least one answer for evaluation' });
    }

    const session = await InterviewSession.findOne({
      _id: sessionId,
      user: req.user._id,
    });

    if (!session) {
      return res.status(404).json({ message: 'Interview session not found' });
    }

    const normalizedAnswers = session.questions.map((item, index) => ({
      question: item.question,
      answer: answers[index]?.answer || '',
      idealAnswer: item.idealAnswer || '',
    }));

    const evaluation = await evaluateInterviewAnswers({
      role: session.role,
      type: session.type,
      difficulty: session.difficulty,
      answers: normalizedAnswers,
    });

    session.answers = evaluation.answers;
    session.score = evaluation.score;
    session.feedback = evaluation.feedback;
    session.strengths = evaluation.strengths;
    session.weaknesses = evaluation.weaknesses;
    session.suggestions = evaluation.suggestions;
    session.status = 'evaluated';

    const updatedSession = await session.save();

    res.json(updatedSession);
  } catch (error) {
    console.error('Interview evaluation error:', error);
    res.status(500).json({ message: error.message || 'Failed to evaluate interview answers' });
  }
};

const getInterviewHistory = async (req, res) => {
  try {
    const sessions = await InterviewSession.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json(sessions);
  } catch (error) {
    console.error('Interview history error:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch interview history' });
  }
};

module.exports = {
  generateQuestions,
  evaluateSession,
  getInterviewHistory,
};
