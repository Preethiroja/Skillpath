const axios = require('axios');

// Supports either env var name: GEMINI_API_KEY is the canonical name going
// forward, but OPENAI_API_KEY is still accepted so existing .env files (like
// one that already has a Gemini key stored under OPENAI_API_KEY) keep working
// without an edit.
const getApiKey = () => process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

const isKeyConfigured = () => {
  const key = getApiKey();
  return Boolean(key) && key !== 'your_openai_api_key' && key !== 'your_gemini_api_key';
};

// Mock fallbacks to allow fully functional offline usage
const getMockRoadmap = (title, targetSkills, level) => {
  return {
    title: `AI Path: Become a ${title}`,
    description: `A curated learning route to transition into a ${title} focusing on ${targetSkills.join(', ')}.`,
    difficulty: level || 'Beginner',
    nodes: [
      {
        id: 'node-1',
        type: 'course',
        title: `Introduction to ${targetSkills[0] || 'Web Development'}`,
        description: `Learn the fundamentals of ${targetSkills[0] || 'programming'} including core syntaxes and toolsets.`,
        status: 'unlocked',
        resourceRef: null,
      },
      {
        id: 'node-2',
        type: 'quiz',
        title: `Fundamentals Quiz: ${targetSkills[0] || 'Tech Core'}`,
        description: 'Test your understanding of basic syntax, variables, and structures.',
        status: 'locked',
        resourceRef: null,
      },
      {
        id: 'node-3',
        type: 'article',
        title: `Advanced Concepts in ${targetSkills[1] || 'State Management'}`,
        description: 'An in-depth article on architectural design patterns and debugging techniques.',
        status: 'locked',
        resourceRef: null,
      },
      {
        id: 'node-4',
        type: 'project',
        title: `Build a Capstone Portfolio Application`,
        description: `Create a fully responsive, functional web project integrating ${targetSkills.join(' & ')}.`,
        status: 'locked',
        resourceRef: null,
      }
    ]
  };
};

const getMockQuiz = (topic, difficulty) => {
  return [
    {
      questionText: `Which of the following is correct regarding ${topic || 'React'}?`,
      options: [
        'It is a database system',
        'It uses a virtual DOM for efficient updates',
        'It is primarily a style framework',
        'It is built exclusively for mobile development'
      ],
      correctAnswerIndex: 1,
      explanation: 'React uses a Virtual DOM representation to reconcile updates with the actual browser DOM efficiently.'
    },
    {
      questionText: `What is a common best practice in ${topic || 'Development'}?`,
      options: [
        'Hardcoding secrets in repository commits',
        'Writing clean, self-documenting code with unit tests',
        'Skipping validation checks to optimize speed',
        'Deploying untested code directly to production'
      ],
      correctAnswerIndex: 1,
      explanation: 'Testing and maintainable code quality are fundamental to sustainable industry-level software engineering.'
    }
  ];
};

const getMockResumeAnalysis = (text) => {
  return {
    skillsFound: ['JavaScript', 'HTML5', 'CSS3', 'Git', 'Node.js (basic)'],
    skillsGaps: ['React Router', 'Redux Toolkit', 'TypeScript', 'Docker', 'Jest testing'],
    formattingScore: 78,
    recommendations: 'Add metrics to achievements (e.g., "improved load time by 30%"). Standardize chronological layout and highlight collaborative projects.',
    feedback: 'Your resume shows strong core javascript skills. Focus on adding framework capabilities and deployment experience to match mid-level requirements.'
  };
};

const getMockMockInterview = (role, level) => {
  return [
    {
      id: 'q-1',
      question: `Describe the lifecycle of a request in an Express.js backend. How do middlewares fit in?`,
      type: 'conceptual'
    },
    {
      id: 'q-2',
      question: `What are the trade-offs of storing sessions in JSON Web Tokens (JWT) vs server-side Sessions?`,
      type: 'security'
    },
    {
      id: 'q-3',
      question: `Write a Javascript function to find the first non-repeating character in a string. What is its time complexity?`,
      type: 'coding'
    }
  ];
};

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

// Converts an OpenAI-style messages array ([{role: 'system'|'user'|'assistant', content}])
// into Gemini's request shape: a top-level systemInstruction plus a contents
// array using Gemini's 'user'/'model' roles instead of 'user'/'assistant'.
const toGeminiRequest = (messages, responseFormat) => {
  const systemText = messages
    .filter((m) => m.role === 'system')
    .map((m) => m.content)
    .join('\n\n');

  const contents = messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

  const body = { contents, generationConfig: { temperature: 0.7 } };
  if (systemText) {
    body.systemInstruction = { parts: [{ text: systemText }] };
  }
  if (responseFormat === 'json') {
    body.generationConfig.responseMimeType = 'application/json';
  }
  return body;
};

// Function name kept as callOpenAI (rather than renamed to callGemini) so every
// other function in this file — generateLearningPath, generateQuiz, analyzeResume,
// chatMentor, analyzeCareerAssessment, getMockInterviewQuestions — needed zero
// changes to switch providers. Same signature, same return contract (resolves to
// the raw text/JSON-string response, throws on failure).
const callOpenAI = async (messages, responseFormat = 'text') => {
  if (!isKeyConfigured()) {
    throw new Error('Gemini API key missing. Fallback triggered.');
  }

  try {
    const payload = toGeminiRequest(messages, responseFormat);
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

    const response = await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': getApiKey(),
      },
      timeout: 30000,
    });

    const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error('Gemini API returned an empty response (possibly blocked by safety filters)');
    }
    return text;
  } catch (error) {
    const detail = error.response?.data?.error?.message || error.message;
    console.error('Gemini API request failed:', detail);
    throw error;
  }
};

const generateLearningPath = async (title, targetSkills, currentSkills, level, commitmentHours) => {
  if (!isKeyConfigured()) {
    console.log('AI key not configured. Generating mock roadmap.');
    return getMockRoadmap(title, targetSkills, level);
  }

  const prompt = `
    You are an expert AI Career and Tech Mentor. Generate a highly detailed, personalized learning path for a student wanting to become a "${title}".
    Target Skills to acquire: ${targetSkills.join(', ')}.
    Current Skills: ${currentSkills.join(', ')}.
    Level: ${level}.
    Weekly commitment: ${commitmentHours} hours.
    
    You MUST respond with a JSON object strictly fitting the following format. Ensure there are 4 to 6 logical nodes representing a chronological path:
    {
      "title": "Path Title",
      "description": "Short overall path description",
      "difficulty": "Beginner/Intermediate/Advanced",
      "nodes": [
        {
          "id": "node-1",
          "type": "course",
          "title": "Title of step",
          "description": "Details on what to learn",
          "status": "unlocked"
        },
        {
          "id": "node-2",
          "type": "quiz",
          "title": "Title of step",
          "description": "Description of quiz topic",
          "status": "locked"
        },
        {
          "id": "node-3",
          "type": "project",
          "title": "Title of step",
          "description": "Details of what project to build",
          "status": "locked"
        }
      ]
    }
  `;

  try {
    const rawResult = await callOpenAI(
      [
        { role: 'system', content: 'You are a technical path generator. Only output JSON.' },
        { role: 'user', content: prompt }
      ],
      'json'
    );
    return JSON.parse(rawResult);
  } catch (error) {
    console.log('Falling back to mock roadmap generator due to error.');
    return getMockRoadmap(title, targetSkills, level);
  }
};

const generateQuiz = async (topic, difficulty) => {
  if (!isKeyConfigured()) {
    console.log('AI key not configured. Generating mock quiz.');
    return getMockQuiz(topic, difficulty);
  }

  const prompt = `
    Generate 3 multiple choice questions for the topic "${topic}" at "${difficulty}" difficulty.
    Respond with a JSON array strictly matching this format:
    [
      {
        "questionText": "Question description",
        "options": ["option A", "option B", "option C", "option D"],
        "correctAnswerIndex": 0,
        "explanation": "Explanation of why the correct option is right"
      }
    ]
  `;

  try {
    const rawResult = await callOpenAI(
      [
        { role: 'system', content: 'You are a quiz writer. Respond only in JSON.' },
        { role: 'user', content: prompt }
      ],
      'json'
    );
    return JSON.parse(rawResult);
  } catch (error) {
    console.log('Falling back to mock quiz due to error.');
    return getMockQuiz(topic, difficulty);
  }
};

const analyzeResume = async (resumeText) => {
  if (!isKeyConfigured()) {
    console.log('AI key not configured. Generating mock resume analysis.');
    return getMockResumeAnalysis(resumeText);
  }

  const prompt = `
    Analyze this candidate's resume content:
    "${resumeText}"
    
    Extract the following information. Return a JSON object matching this schema:
    {
      "skillsFound": ["skill1", "skill2"],
      "skillsGaps": ["gap1", "gap2"],
      "formattingScore": 85,
      "recommendations": "Bullet points summarizing concrete resume suggestions",
      "feedback": "Overall technical feedback for the profile"
    }
  `;

  try {
    const rawResult = await callOpenAI(
      [
        { role: 'system', content: 'You are a professional technical recruiter. Return JSON.' },
        { role: 'user', content: prompt }
      ],
      'json'
    );
    return JSON.parse(rawResult);
  } catch (error) {
    return getMockResumeAnalysis(resumeText);
  }
};

const chatMentor = async (history, newMessage, type = 'mentor') => {
  if (!isKeyConfigured()) {
    return `[Mock AI Mentor]: Thank you for asking. I am here to help you guide your path in ${type === 'coding' ? 'software coding' : 'technical career progression'}. Without an active AI API key, I am functioning in sandbox mode. How can I assist you with mock responses today?`;
  }

  const formattedMessages = history.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'assistant',
    content: msg.content
  }));

  const systemInstructions = {
    mentor: 'You are an encouraging, experienced senior software architect mentor. Guide the student on what skills to study next and clarify engineering concepts.',
    career: 'You are a seasoned career advisor. Advise students on job search strategies, resume highlights, and interview preparation.',
    coding: 'You are an interactive coding mentor. Help explain code patterns, identify bugs, and explain complex data structures clearly.',
    mock_interview: 'You are a technical interviewer. Present challenging tech questions, rate student answers, and provide constructive feedback.'
  };

  formattedMessages.unshift({
    role: 'system',
    content: systemInstructions[type] || systemInstructions.mentor
  });

  formattedMessages.push({
    role: 'user',
    content: newMessage
  });

  try {
    return await callOpenAI(formattedMessages, 'text');
  } catch (error) {
    console.error('AI mentor call failed despite a configured key:', error.message);
    return "I'm having a little trouble connecting to the AI service right now — this can happen if the configured API key isn't valid for this provider. Try again in a moment, and in the meantime, feel free to keep exploring your roadmap!";
  }
};

const getMockInterviewQuestions = async (role, level) => {
  if (!isKeyConfigured()) {
    return getMockMockInterview(role, level);
  }

  const prompt = `
    Generate 3 technical interview questions for a "${role}" role at "${level}" level.
    Return a JSON array of objects:
    [
      {
        "id": "q-1",
        "question": "Question text",
        "type": "conceptual/coding/security"
      }
    ]
  `;

  try {
    const rawResult = await callOpenAI(
      [
        { role: 'system', content: 'You are a lead technical interviewer. Return JSON.' },
        { role: 'user', content: prompt }
      ],
      'json'
    );
    return JSON.parse(rawResult);
  } catch (error) {
    return getMockMockInterview(role, level);
  }
};

// ----------------------------------------------------------------------
// Career Assessment Analysis
// ----------------------------------------------------------------------
const { CAREERS, CAREER_TRAIT_WEIGHTS, ASSESSMENT_QUESTIONS } = require('../data/assessmentQuestions');

// Deterministic, non-AI fallback: sums trait weights from the user's chosen
// options, then scores each career by how well its trait profile matches.
// Used when no AI key is configured, so the assessment is always usable.
const localAnalyzeAssessment = (answers) => {
  const questionMap = new Map(ASSESSMENT_QUESTIONS.map((q) => [q.id, q]));
  const traitScores = {};

  answers.forEach(({ questionId, selectedOptionIndex }) => {
    const question = questionMap.get(questionId);
    const option = question?.options?.[selectedOptionIndex];
    if (!option) return;
    Object.entries(option.traits || {}).forEach(([trait, weight]) => {
      traitScores[trait] = (traitScores[trait] || 0) + weight;
    });
  });

  // Score each career: dot product of user trait vector with career weight vector
  const careerScores = CAREERS.map((career) => {
    const weights = CAREER_TRAIT_WEIGHTS[career.key] || {};
    let score = 0;
    Object.entries(weights).forEach(([trait, weight]) => {
      score += (traitScores[trait] || 0) * weight;
    });
    return { career, score };
  });

  // Scale confidence relative to the spread across all careers, so the best
  // fit lands near ~95% and weaker fits taper down realistically instead of
  // every career saturating at the same ceiling.
  const scores = careerScores.map((c) => c.score);
  const maxScore = Math.max(...scores);
  const minScore = Math.min(...scores);
  const range = maxScore - minScore || 1;
  careerScores.forEach((c) => {
    c.confidence = Math.round(52 + 45 * ((c.score - minScore) / range));
  });

  careerScores.sort((a, b) => b.score - a.score);
  const top = careerScores.slice(0, 4);

  const sortedTraits = Object.entries(traitScores).sort((a, b) => b[1] - a[1]);
  const topTraits = sortedTraits.slice(0, 4).map(([t]) => t);
  const bottomTraits = sortedTraits.slice(-2).map(([t]) => t);

  const traitLabels = {
    logical: 'logical reasoning', creative: 'creative thinking', analytical: 'analytical thinking',
    communication: 'communication', mathematics: 'mathematics', programming: 'programming aptitude',
    curiosity: 'curiosity', leadership: 'leadership', teamwork: 'collaboration', independence: 'independent work',
    patience: 'patience under pressure', detail: 'attention to detail',
  };

  return {
    personalitySummary: `Your responses point to a learner who leans on ${topTraits.map((t) => traitLabels[t] || t).join(', ')}. You tend to thrive in environments that let you apply these strengths directly.`,
    strengths: topTraits.map((t) => traitLabels[t] || t),
    weaknesses: bottomTraits.map((t) => `Could grow further in ${traitLabels[t] || t}`),
    learningStyle: traitScores.independence > (traitScores.teamwork || 0)
      ? 'Self-directed — you learn best exploring hands-on with room to experiment independently.'
      : 'Collaborative — you learn best through discussion, pairing, and shared problem-solving.',
    skillProfile: top[0]?.career.suggestedSkills || [],
    interestProfile: topTraits.map((t) => traitLabels[t] || t),
    careerRecommendations: top.map(({ career, confidence }) => ({
      career: career.title,
      confidence,
      reasoning: `Your strengths in ${topTraits.slice(0, 2).map((t) => traitLabels[t] || t).join(' and ')} align well with what a ${career.title} does day to day: ${career.description}`,
      suggestedSkills: career.suggestedSkills,
    })),
  };
};

const analyzeCareerAssessment = async (answers) => {
  if (!isKeyConfigured()) {
    console.log('AI key not configured. Generating local heuristic assessment report.');
    return localAnalyzeAssessment(answers);
  }

  const questionMap = new Map(ASSESSMENT_QUESTIONS.map((q) => [q.id, q]));
  const transcript = answers
    .map(({ questionId, selectedOptionIndex }) => {
      const q = questionMap.get(questionId);
      const option = q?.options?.[selectedOptionIndex];
      return q && option ? `[${q.category}] Q: ${q.question}\nA: ${option.text}` : null;
    })
    .filter(Boolean)
    .join('\n\n');

  const careerList = CAREERS.map((c) => `${c.title} — ${c.description}`).join('\n');

  const prompt = `
    A student completed a career-discovery assessment. Here are their question/answer pairs:

    ${transcript}

    Candidate careers to choose from (pick and rank the best-fitting ones, you may also propose
    a closely related career not on this list if clearly a stronger fit):
    ${careerList}

    Analyze the responses and return a JSON object matching this schema exactly:
    {
      "personalitySummary": "2-3 sentence personality summary",
      "strengths": ["strength1", "strength2", "strength3"],
      "weaknesses": ["growth area 1", "growth area 2"],
      "learningStyle": "1-2 sentence description of how they learn best",
      "skillProfile": ["skill1", "skill2", "skill3"],
      "interestProfile": ["interest1", "interest2", "interest3"],
      "careerRecommendations": [
        { "career": "Career Title", "confidence": 94, "reasoning": "why this fits", "suggestedSkills": ["skill1", "skill2"] }
      ]
    }
    Return the top 4 career recommendations, ordered by confidence (0-100) descending.
  `;

  try {
    const rawResult = await callOpenAI(
      [
        { role: 'system', content: 'You are an expert career counselor and technical assessor. Return JSON only.' },
        { role: 'user', content: prompt },
      ],
      'json'
    );
    return JSON.parse(rawResult);
  } catch (error) {
    console.error('Career assessment AI analysis failed, using local fallback:', error.message);
    return localAnalyzeAssessment(answers);
  }
};

module.exports = {
  generateLearningPath,
  generateQuiz,
  analyzeResume,
  chatMentor,
  getMockInterviewQuestions,
  analyzeCareerAssessment,
};
