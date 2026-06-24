const pdfParse = require('pdf-parse');
const ResumeAnalysis = require('../models/ResumeAnalysis');
const { analyzeResumeText } = require('../services/geminiService');

const analyzeResume = async (req, res) => {
  try {
    const jobDescription = String(req.body.jobDescription || '').trim();

    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a PDF file' });
    }

    if (!jobDescription) {
      return res.status(400).json({ message: 'Please paste the job description before analyzing your resume' });
    }

    if (req.file.mimetype !== 'application/pdf') {
      return res.status(400).json({ message: 'Invalid file format. Please upload a PDF resume' });
    }

    // Parse PDF text from Buffer
    const parsedPdf = await pdfParse(req.file.buffer);
    const resumeText = parsedPdf.text;

    if (!resumeText || resumeText.trim().length === 0) {
      return res.status(400).json({ message: 'Could not extract text from the PDF. Ensure the PDF is not scanned or empty.' });
    }

    // Call Gemini Service for job-description match evaluation
    const analysis = await analyzeResumeText(resumeText, jobDescription);
    const matchScore = analysis.matchScore ?? analysis.atsScore ?? 0;

    // Save report in Database
    const newAnalysis = await ResumeAnalysis.create({
      user: req.user._id,
      fileName: req.file.originalname,
      jobDescription,
      matchScore,
      atsScore: analysis.atsScore ?? matchScore,
      missingKeywords: analysis.missingKeywords || [],
      matchedKeywords: analysis.matchedKeywords || [],
      suggestions: analysis.suggestions || [],
      rewrittenBulletPoints: analysis.rewrittenBulletPoints || [],
      extractedText: resumeText,
    });

    res.status(201).json(newAnalysis);
  } catch (error) {
    console.error('Resume controller error:', error);
    res.status(500).json({ message: error.message || 'Failed to analyze resume' });
  }
};

const getResumeAnalyses = async (req, res) => {
  try {
    const analyses = await ResumeAnalysis.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('-extractedText -jobDescription');

    res.status(200).json(analyses);
  } catch (error) {
    console.error('Resume history controller error:', error);
    res.status(500).json({ message: error.message || 'Failed to load resume analyses' });
  }
};

module.exports = {
  analyzeResume,
  getResumeAnalyses,
};
