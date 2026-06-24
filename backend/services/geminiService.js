const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini API
// If no key is set, the service falls back to generating structured realistic data so the app remains runnable
const getGeminiModel = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_jwt_secret_key_here' || apiKey.startsWith('your_')) {
    console.warn('GEMINI_API_KEY not set or placeholder. Running in demo fallback mode.');
    return null;
  }
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    return genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: "application/json" }
    });
  } catch (error) {
    console.error('Error initializing Gemini model:', error);
    return null;
  }
};

/**
 * Analyze Resume Text
 */
const extractJsonObject = (textResponse) => {
  try {
    return JSON.parse(textResponse);
  } catch (error) {
    const match = textResponse.match(/\{[\s\S]*\}/);
    if (!match) {
      throw error;
    }
    return JSON.parse(match[0]);
  }
};

const normalizeStringArray = (value) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => String(item || '').trim())
    .filter(Boolean)
    .slice(0, 12);
};

const clampScore = (score, fallback = 0) => {
  const numericScore = Number(score);
  if (Number.isNaN(numericScore)) {
    return fallback;
  }
  return Math.min(Math.max(Math.round(numericScore), 0), 100);
};

const buildResumeMatchFallback = (jobDescription = '') => {
  const hasJobDescription = jobDescription.trim().length > 0;
  const fallbackMatchedKeywords = [
    'JavaScript',
    'React',
    'Node.js',
    'MongoDB',
    'REST APIs',
    'Git',
  ];

  const fallbackMissingKeywords = hasJobDescription
    ? ['TypeScript', 'Docker', 'CI/CD', 'Cloud Deployment', 'Unit Testing']
    : ['CI/CD Pipelines', 'Docker', 'Redis', 'Unit Testing (Jest/Mocha)', 'System Design'];

  return {
    matchScore: hasJobDescription ? 72 : 68,
    atsScore: hasJobDescription ? 72 : 68,
    missingKeywords: fallbackMissingKeywords,
    matchedKeywords: fallbackMatchedKeywords,
    suggestions: [
      'Add measurable project impact such as latency reduction, user growth, automation time saved, or accuracy improved.',
      'Mirror the job description language for required tools and responsibilities where you genuinely have experience.',
      'Move the most relevant technical skills near the top so recruiters and ATS systems can find them quickly.',
      'Strengthen project bullets with action verbs, technical context, and outcomes instead of only listing features.'
    ],
    rewrittenBulletPoints: [
      'Built a responsive full-stack application with React, Node.js, Express, and MongoDB, improving user workflow speed through reusable components and optimized API calls.',
      'Designed REST API endpoints with authentication, validation, and structured database models to support reliable user-facing career tools.',
      'Improved project maintainability by organizing frontend state, route protection, and reusable UI patterns across the application.'
    ],
  };
};

const analyzeResumeText = async (resumeText, jobDescription = '') => {
  const model = getGeminiModel();
  
  if (!model) {
    // Return realistic fallback database analysis
    return buildResumeMatchFallback(jobDescription);
  }

  const prompt = `
    You are an expert ATS reviewer and hiring manager.
    Compare the resume against the job description when it is provided.
    Return ONLY a JSON object with the following fields:
    - matchScore: a number between 0 and 100 representing job-description fit
    - atsScore: same number as matchScore for compatibility
    - missingKeywords: an array of important keywords, skills, tools, or responsibilities from the job description missing from the resume
    - matchedKeywords: an array of important keywords, skills, tools, or responsibilities found in both the resume and job description
    - suggestions: an array of specific resume improvement recommendations
    - rewrittenBulletPoints: an array of 3 to 5 rewritten resume bullet points aligned with the job description
    
    Resume Text:
    """
    ${resumeText}
    """

    Job Description:
    """
    ${jobDescription || 'No job description provided. Evaluate against common ATS and recruiter expectations for software/development roles.'}
    """
  `;

  try {
    const result = await model.generateContent(prompt);
    const parsed = extractJsonObject(result.response.text());
    const matchScore = clampScore(parsed.matchScore ?? parsed.atsScore, 68);

    return {
      matchScore,
      atsScore: clampScore(parsed.atsScore ?? matchScore, matchScore),
      missingKeywords: normalizeStringArray(parsed.missingKeywords),
      matchedKeywords: normalizeStringArray(parsed.matchedKeywords),
      suggestions: normalizeStringArray(parsed.suggestions),
      rewrittenBulletPoints: normalizeStringArray(parsed.rewrittenBulletPoints),
    };
  } catch (error) {
    console.error('Gemini Resume Analysis Error:', error);
    return buildResumeMatchFallback(jobDescription);
  }
};

/**
 * Skill Gap Analysis
 */
const analyzeSkillGap = async (userSkills, targetRole) => {
  const model = getGeminiModel();

  if (!model) {
    // Fallback data
    const allRoleDefaults = {
      SDE: {
        strengths: userSkills.filter(s => ['java', 'python', 'c++', 'dsa', 'sql', 'git'].includes(s.toLowerCase())),
        missingSkills: ['System Design', 'Operating Systems', 'DBMS', 'Object-Oriented Design'],
        suggestions: ['Practice algorithms on LeetCode/GeeksforGeeks', 'Build projects demonstrating concurrency and multithreading']
      },
      'Frontend Developer': {
        strengths: userSkills.filter(s => ['html', 'css', 'javascript', 'react', 'tailwind'].includes(s.toLowerCase())),
        missingSkills: ['TypeScript', 'Next.js', 'Redux Toolkit', 'Web Vitals Performance Optimization'],
        suggestions: ['Convert one of your existing React projects to TypeScript', 'Learn about server-side rendering (SSR) using Next.js']
      },
      'Backend Developer': {
        strengths: userSkills.filter(s => ['node', 'express', 'mongodb', 'sql', 'javascript'].includes(s.toLowerCase())),
        missingSkills: ['PostgreSQL/MySQL', 'Redis Caching', 'Docker', 'REST API Best Practices', 'JWT Auth'],
        suggestions: ['Implement database migrations and design complex SQL relationships', 'Containerize your application with Docker']
      },
      'Full Stack Developer': {
        strengths: userSkills,
        missingSkills: ['GraphQL', 'WebSockets', 'CI/CD Pipelines', 'AWS Deployment'],
        suggestions: ['Build a real-time collaborative tool using WebSockets', 'Automate code deployments using GitHub Actions']
      },
      'Data Analyst': {
        strengths: userSkills.filter(s => ['python', 'pandas', 'sql', 'excel'].includes(s.toLowerCase())),
        missingSkills: ['PowerBI / Tableau', 'NumPy', 'Data Cleaning Techniques', 'Advanced Excel VBA'],
        suggestions: ['Create an interactive dashboard in Tableau and publish it', 'Solve database analysis queries on SQL hackathons']
      },
      'AI/ML Engineer': {
        strengths: userSkills.filter(s => ['python', 'math', 'statistics'].includes(s.toLowerCase())),
        missingSkills: ['PyTorch / TensorFlow', 'Scikit-Learn', 'Data Pipelines', 'Deep Learning Architectures', 'Model Deployment (Flask/FastAPI)'],
        suggestions: ['Train a custom neural network using PyTorch on a kaggle dataset', 'Deploy an ML model endpoint via FastAPI']
      }
    };

    const roleData = allRoleDefaults[targetRole] || {
      strengths: userSkills.slice(0, 3),
      missingSkills: ['Core Industry Practices', 'System Scale Control', 'Unit Testing'],
      suggestions: ['Add project complexities', 'Review requirements for ' + targetRole]
    };

    if (roleData.strengths.length === 0 && userSkills.length > 0) {
      roleData.strengths = [userSkills[0]];
    }

    return roleData;
  }

  const prompt = `
    You are an technical recruiter analyzing candidate skill matches.
    Compare the candidate's current skills against the requirements for the target role: "${targetRole}".
    Current Skills: ${JSON.stringify(userSkills)}

    Return ONLY a JSON object containing:
    - strengths: an array of strings showing matching skills the user already possesses
    - missingSkills: an array of strings representing technologies or concepts they should acquire for this role
    - suggestions: an array of strings with specific action items to bridge the gap
  `;

  try {
    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
  } catch (error) {
    console.error('Gemini Skill Gap Analysis Error:', error);
    throw new Error('Gemini skills analysis failed. Please try again.');
  }
};

/**
 * AI Career Roadmap Generator (6 Months)
 */
const generateCareerRoadmap = async (currentSkills, targetRole, currentYear) => {
  const model = getGeminiModel();

  if (!model) {
    // Fallback data
    return {
      timeline: [
        {
          month: 'Month 1: Advanced Core Principles',
          topics: ['Deep dive into core structures for ' + targetRole, 'Version control configurations (Git/GitHub)'],
          resources: ['MDN documentation', 'YouTube crash courses'],
          milestone: 'Complete fundamental code exercises and simple tools.'
        },
        {
          month: 'Month 2: Essential Toolings & Frameworks',
          topics: ['Core industry libraries', 'Responsive design guidelines'],
          resources: ['Official library documentation', 'FrontendMasters / freeCodeCamp'],
          milestone: 'Create your first interactive layout or backend server.'
        },
        {
          month: 'Month 3: Advanced Integrations',
          topics: ['Databases & REST communication APIs', 'State control tools'],
          resources: ['MongoDB University', 'Redux / SQL tutorials'],
          milestone: 'Connect a client application to a live database.'
        },
        {
          month: 'Month 4: Testing & Security Configurations',
          topics: ['JWT and authentication patterns', 'Unit testing models'],
          resources: ['Auth0 blogs', 'Jest testing documentations'],
          milestone: 'Write complete test suites and lock routes behind middleware.'
        },
        {
          month: 'Month 5: Deployment & Operations',
          topics: ['Docker setups', 'Cloud hosting (AWS/Render/Vercel)', 'CI/CD basics'],
          resources: ['Docker docs', 'GitHub actions workflows'],
          milestone: 'Host your fullstack application live with CI/CD triggers.'
        },
        {
          month: 'Month 6: Interview Preparation & Polish',
          topics: ['Behavioral practice', 'DSA patterns review', 'Resume optimization'],
          resources: ['LeetCode', 'Tech Interview Handbook'],
          milestone: 'Pass 3 mock interview sets.'
        }
      ]
    };
  }

  const prompt = `
    You are an expert career mentor. Create a detailed, personalized 6-month learning roadmap.
    Input parameters:
    - Target Role: "${targetRole}"
    - Current Year of Study: "${currentYear}"
    - Current Skills: ${JSON.stringify(currentSkills)}

    Format the month-wise roadmap for exactly 6 months.
    Return ONLY a JSON object containing a "timeline" array. Each item in the array must contain:
    - month: string (e.g. "Month 1: [Topic Title]")
    - topics: array of strings (specific sub-topics to learn)
    - resources: array of strings (recommended free platforms or resources)
    - milestone: string (a tangible outcome/project to build at the end of the month)
  `;

  try {
    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
  } catch (error) {
    console.error('Gemini Roadmap Generation Error:', error);
    throw new Error('Gemini roadmap generation failed. Please try again.');
  }
};

/**
 * AI Mock Interview Question Generator
 */
const generateInterviewQuestions = async (role, interviewType, difficulty, questionCount = 5) => {
  const model = getGeminiModel();
  const count = Math.min(Math.max(Number(questionCount) || 5, 5), 10);

  const buildFallbackQuestions = () => {
    const typedQuestionBank = {
      HR: [
        'Tell me about yourself and explain why you are interested in this role.',
        'Describe a time when you handled a challenging situation in a team.',
        'What are your short-term career goals after joining as a ' + role + '?',
        'How do you respond when you receive critical feedback?',
        'Why should we select you for this opportunity?',
        'Tell me about a time you showed ownership of a project.',
        'How do you manage deadlines when multiple tasks are pending?',
        'What motivates you to keep improving your skills?',
        'Describe your biggest learning from a recent academic or project experience.',
        'Where do you see yourself growing in the next two years?'
      ],
      Technical: [
        'Explain the core technical skills required for a ' + role + ' and where you currently stand.',
        'Walk through the architecture of one project you built recently.',
        'How would you debug a production issue reported by users?',
        'Explain how you would design a reliable API for a placement portal.',
        'What trade-offs do you consider while choosing a database?',
        'How do you ensure code quality in a team project?',
        'Explain authentication and authorization in a full-stack application.',
        'How would you improve performance in an application that loads slowly?',
        'Describe one technical concept you learned deeply and applied in a project.',
        'How would you handle edge cases and validation in user input flows?'
      ],
      DSA: [
        'Explain your approach to solving a two-pointer array problem.',
        'How would you detect a cycle in a linked list?',
        'Compare BFS and DFS with examples of when to use each.',
        'How do you identify whether a problem needs dynamic programming?',
        'Explain time and space complexity for binary search.',
        'How would you find the first non-repeating character in a string?',
        'Describe how hashing improves lookup-heavy problems.',
        'How would you solve a shortest path problem in an unweighted graph?',
        'Explain the difference between stack and queue with real use cases.',
        'How do you optimize a brute force solution during interviews?'
      ],
      'Project Discussion': [
        'Pick your strongest project and explain the problem it solves.',
        'What was your exact contribution in your most recent project?',
        'Explain the database schema or data flow of one project.',
        'What was the hardest bug you faced and how did you fix it?',
        'How would you scale your project for 10,000 users?',
        'Which features would you add next if you had one more month?',
        'How did you handle authentication, validation, or security in your project?',
        'What did you learn from building this project?',
        'How would you explain your project to a non-technical interviewer?',
        'What trade-offs did you make while building the project?'
      ]
    };

    return {
      questions: (typedQuestionBank[interviewType] || typedQuestionBank.Technical)
        .slice(0, count)
        .map((question) => ({
          question,
          idealAnswer: 'A strong answer should be structured, specific, and backed by a real example. Mention your approach, the reasoning behind it, trade-offs considered, and measurable outcomes where possible.'
        }))
    };
  };

  if (!model) {
    return buildFallbackQuestions();
  }

  const prompt = `
    You are an expert campus placement interviewer.
    Generate exactly ${count} interview questions for:
    - Role: "${role}"
    - Interview Type: "${interviewType}"
    - Difficulty: "${difficulty}"

    Return ONLY a JSON object with a "questions" array.
    Each question item must contain:
    - question: string
    - idealAnswer: string, a concise model answer or answer framework

    Keep questions realistic for student placement interviews.
  `;

  try {
    const result = await model.generateContent(prompt);
    const parsed = JSON.parse(result.response.text());
    if (!Array.isArray(parsed.questions) || parsed.questions.length === 0) {
      throw new Error('Invalid interview question format');
    }
    return {
      questions: parsed.questions.slice(0, count).map((item) => ({
        question: item.question,
        idealAnswer: item.idealAnswer || '',
      }))
    };
  } catch (error) {
    console.error('Gemini Interview Question Error:', error);
    return buildFallbackQuestions();
  }
};

/**
 * AI Mock Interview Answer Evaluator
 */
const evaluateInterviewAnswers = async ({ role, type, difficulty, answers }) => {
  const model = getGeminiModel();

  const buildFallbackEvaluation = () => {
    const evaluatedAnswers = answers.map((item) => {
      const wordCount = item.answer.trim().split(/\s+/).filter(Boolean).length;
      const hasSpecifics = /\d|project|built|implemented|optimized|improved|designed|debugged/i.test(item.answer);
      let feedback = 'Add more structure: start with the situation, explain your approach, and close with a result or learning.';

      if (wordCount >= 45 && hasSpecifics) {
        feedback = 'Good answer. It includes concrete detail and shows practical thinking. Tighten it further with measurable outcomes or trade-offs.';
      } else if (wordCount >= 25) {
        feedback = 'Decent answer. It covers the basic idea, but needs stronger examples, clearer reasoning, and a specific result.';
      }

      return {
        question: item.question,
        answer: item.answer,
        idealAnswer: item.idealAnswer || 'A strong answer should be concise, structured, specific to the role, and supported by an example from a project, internship, coursework, or practice.',
        feedback,
      };
    });

    const answeredCount = answers.filter((item) => item.answer.trim().length >= 20).length;
    const detailBonus = answers.filter((item) => /\d|project|built|implemented|optimized|improved|designed|debugged/i.test(item.answer)).length;
    const score = Math.min(90, Math.max(35, Math.round((answeredCount / Math.max(answers.length, 1)) * 65 + detailBonus * 5)));

    return {
      score,
      feedback: 'Your mock interview shows a usable base. The next improvement is to make every answer more structured, example-driven, and aligned with the selected role.',
      strengths: [
        answeredCount > 0 ? 'Attempted the interview flow with relevant responses' : 'Completed the interview attempt',
        detailBonus > 0 ? 'Included some practical or project-based details' : 'Clear opportunity to add project-based evidence',
        'Shows readiness to practice role-specific interviews'
      ],
      weaknesses: [
        'Some answers need stronger structure and examples',
        'Several responses can be improved with measurable impact',
        'Ideal interview answers should connect skills directly to the role'
      ],
      suggestions: [
        'Use the STAR format for HR and project answers: Situation, Task, Action, Result.',
        'For technical answers, explain trade-offs, edge cases, and complexity where relevant.',
        'Add one concrete project or coding example in every major answer.',
        'Practice answering within 60-90 seconds while keeping the response focused.'
      ],
      answers: evaluatedAnswers,
    };
  };

  if (!model) {
    return buildFallbackEvaluation();
  }

  const prompt = `
    You are an expert placement interviewer evaluating a mock interview.
    Context:
    - Role: "${role}"
    - Interview Type: "${type}"
    - Difficulty: "${difficulty}"
    - Candidate Answers: ${JSON.stringify(answers)}

    Return ONLY a JSON object with:
    - score: number between 0 and 100
    - feedback: string, overall summary
    - strengths: array of strings
    - weaknesses: array of strings
    - suggestions: array of strings
    - answers: array where each item has question, answer, idealAnswer, feedback

    Be constructive, placement-focused, and specific.
  `;

  try {
    const result = await model.generateContent(prompt);
    const parsed = JSON.parse(result.response.text());
    return {
      score: Math.min(Math.max(Number(parsed.score) || 0, 0), 100),
      feedback: parsed.feedback || '',
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
      weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses : [],
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
      answers: answers.map((item, index) => {
        const parsedItem = Array.isArray(parsed.answers) ? parsed.answers[index] : null;
        return {
          question: item.question,
          answer: item.answer,
          idealAnswer: parsedItem?.idealAnswer || item.idealAnswer || '',
          feedback: parsedItem?.feedback || 'Add more structure, specific examples, and a clearer result.',
        };
      }),
    };
  } catch (error) {
    console.error('Gemini Interview Evaluation Error:', error);
    return buildFallbackEvaluation();
  }
};

module.exports = {
  analyzeResumeText,
  analyzeSkillGap,
  generateCareerRoadmap,
  generateInterviewQuestions,
  evaluateInterviewAnswers,
};
