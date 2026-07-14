// Career Assessment question bank + scoring tables.
//
// Each question belongs to one of the categories required by the spec
// (Interests, Aptitude, Personality, Logical Reasoning, Problem-Solving,
// Programming Interest, Mathematics, Communication, Creativity, Analytical
// Thinking, Preferred Working Style, Favorite Subjects, Career Preferences).
//
// Each option carries small weights toward a fixed set of "traits". When an
// OpenAI key isn't configured, CAREER_TRAIT_WEIGHTS lets us compute a
// deterministic (not AI-generated, but reasonable) match percentage locally —
// the same offline-fallback pattern used elsewhere in openaiService.js.

const TRAITS = [
  'logical', 'creative', 'analytical', 'communication', 'mathematics',
  'programming', 'curiosity', 'leadership', 'teamwork', 'independence',
  'patience', 'detail',
];

const CAREERS = [
  {
    key: 'ai_engineer',
    title: 'AI Engineer',
    description: 'Builds and deploys machine learning models and intelligent systems.',
    suggestedSkills: ['Python', 'Machine Learning', 'TensorFlow', 'Data Structures', 'Statistics'],
  },
  {
    key: 'full_stack_developer',
    title: 'Full Stack Developer',
    description: 'Builds complete web applications spanning frontend and backend.',
    suggestedSkills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'REST APIs'],
  },
  {
    key: 'data_scientist',
    title: 'Data Scientist',
    description: 'Extracts insight and predictions from data using statistics and ML.',
    suggestedSkills: ['Python', 'Statistics', 'Pandas', 'Machine Learning', 'SQL'],
  },
  {
    key: 'cloud_engineer',
    title: 'Cloud Engineer',
    description: 'Designs and manages scalable cloud infrastructure.',
    suggestedSkills: ['AWS', 'Docker', 'Kubernetes', 'Networking', 'Linux'],
  },
  {
    key: 'devops_engineer',
    title: 'DevOps Engineer',
    description: 'Automates deployment pipelines and keeps systems running reliably.',
    suggestedSkills: ['CI/CD', 'Docker', 'Kubernetes', 'Linux', 'Scripting'],
  },
  {
    key: 'cybersecurity_engineer',
    title: 'Cybersecurity Engineer',
    description: 'Protects systems and networks from security threats.',
    suggestedSkills: ['Networking', 'Linux', 'Security Fundamentals', 'Cryptography', 'Ethical Hacking'],
  },
  {
    key: 'ui_ux_designer',
    title: 'UI/UX Designer',
    description: 'Designs intuitive, visually compelling digital experiences.',
    suggestedSkills: ['Figma', 'Design Systems', 'User Research', 'Prototyping', 'HTML/CSS'],
  },
  {
    key: 'mobile_developer',
    title: 'Mobile App Developer',
    description: 'Builds native or cross-platform mobile applications.',
    suggestedSkills: ['React Native', 'Swift/Kotlin', 'Mobile UI Patterns', 'REST APIs', 'App Store Deployment'],
  },
  {
    key: 'backend_developer',
    title: 'Backend Developer',
    description: 'Designs the server-side logic, databases, and APIs behind applications.',
    suggestedSkills: ['Node.js', 'Databases', 'API Design', 'System Design', 'Authentication'],
  },
  {
    key: 'frontend_developer',
    title: 'Frontend Developer',
    description: 'Crafts the user-facing interface and interactions of web applications.',
    suggestedSkills: ['JavaScript', 'React', 'CSS', 'Accessibility', 'Responsive Design'],
  },
];

const CAREER_TRAIT_WEIGHTS = {
  ai_engineer: { mathematics: 3, programming: 3, analytical: 3, curiosity: 2, logical: 2 },
  full_stack_developer: { programming: 3, creative: 2, communication: 1, independence: 2, logical: 2 },
  data_scientist: { mathematics: 3, analytical: 3, curiosity: 2, programming: 2, detail: 2 },
  cloud_engineer: { programming: 2, analytical: 2, independence: 2, logical: 2, detail: 2 },
  devops_engineer: { programming: 2, teamwork: 2, patience: 2, logical: 2, detail: 2 },
  cybersecurity_engineer: { analytical: 3, patience: 2, detail: 3, independence: 2, logical: 2 },
  ui_ux_designer: { creative: 3, communication: 2, detail: 2, teamwork: 2 },
  mobile_developer: { programming: 2, creative: 2, patience: 2, detail: 2 },
  backend_developer: { programming: 3, logical: 3, analytical: 2, independence: 1 },
  frontend_developer: { creative: 2, programming: 2, detail: 2, communication: 1 },
};

const ASSESSMENT_QUESTIONS = [
  { id: 'q1', category: 'Interests', question: 'Which activity sounds most appealing to you?', options: [
    { text: 'Building a website or app from scratch', traits: { programming: 2, creative: 1 } },
    { text: 'Analyzing a dataset to find hidden patterns', traits: { analytical: 2, mathematics: 1 } },
    { text: 'Designing a beautiful, easy-to-use interface', traits: { creative: 2, communication: 1 } },
    { text: 'Securing a system against attackers', traits: { analytical: 2, detail: 1 } },
  ]},
  { id: 'q2', category: 'Aptitude', question: 'When learning something new and technical, you prefer to:', options: [
    { text: 'Dive in and experiment hands-on', traits: { curiosity: 2, independence: 1 } },
    { text: 'Read the documentation thoroughly first', traits: { detail: 2, patience: 1 } },
    { text: 'Watch a video walkthrough', traits: { communication: 1, curiosity: 1 } },
    { text: 'Ask someone experienced to explain it', traits: { communication: 2, teamwork: 1 } },
  ]},
  { id: 'q3', category: 'Personality', question: 'In a group project, you naturally end up:', options: [
    { text: 'Organizing tasks and leading the direction', traits: { leadership: 2, communication: 1 } },
    { text: 'Deep-diving into the hardest technical problem', traits: { independence: 2, analytical: 1 } },
    { text: 'Making sure everyone is heard and aligned', traits: { teamwork: 2, communication: 1 } },
    { text: 'Polishing the details others overlook', traits: { detail: 2, patience: 1 } },
  ]},
  { id: 'q4', category: 'Logical Reasoning', question: 'If all Zorbs are Flixes, and some Flixes are Wibs, which statement is definitely true?', options: [
    { text: 'All Zorbs are Wibs', traits: { logical: -1 } },
    { text: 'Some Zorbs might be Wibs, but not necessarily', traits: { logical: 2, analytical: 1 } },
    { text: 'No Zorbs are Wibs', traits: { logical: -1 } },
    { text: 'All Wibs are Zorbs', traits: { logical: -1 } },
  ]},
  { id: 'q5', category: 'Logical Reasoning', question: 'You notice a pattern: 2, 6, 12, 20, 30 ... What is the next number?', options: [
    { text: '36', traits: { logical: 0 } },
    { text: '40', traits: { logical: 0 } },
    { text: '42', traits: { logical: 2, mathematics: 2 } },
    { text: '44', traits: { logical: 0 } },
  ]},
  { id: 'q6', category: 'Problem-Solving', question: 'When you hit a tough bug or problem, your first instinct is to:', options: [
    { text: 'Break it into smaller pieces and test each one', traits: { analytical: 2, patience: 1 } },
    { text: 'Search for how others solved something similar', traits: { curiosity: 1, communication: 1 } },
    { text: 'Rewrite the approach from scratch', traits: { independence: 2, creative: 1 } },
    { text: 'Ask a teammate to pair on it', traits: { teamwork: 2, communication: 1 } },
  ]},
  { id: 'q7', category: 'Problem-Solving', question: 'You are more energized by problems that are:', options: [
    { text: 'Well-defined with a clear correct answer', traits: { logical: 2, detail: 1 } },
    { text: 'Open-ended with many possible solutions', traits: { creative: 2, curiosity: 1 } },
    { text: 'About people and how systems affect them', traits: { communication: 2, teamwork: 1 } },
    { text: 'About optimizing something that already works', traits: { analytical: 2, detail: 1 } },
  ]},
  { id: 'q8', category: 'Programming Interest', question: 'How do you feel about writing code?', options: [
    { text: "I love it — I'd code even outside of class/work", traits: { programming: 3, curiosity: 1 } },
    { text: "It's fine, I enjoy it as one tool among many", traits: { programming: 2 } },
    { text: "I prefer designing/planning over writing code", traits: { creative: 2, leadership: 1 } },
    { text: 'I would rather work with people than code all day', traits: { communication: 2, teamwork: 1 } },
  ]},
  { id: 'q9', category: 'Programming Interest', question: 'Which type of coding task sounds most fun?', options: [
    { text: 'Training or fine-tuning a machine learning model', traits: { programming: 2, mathematics: 2, curiosity: 1 } },
    { text: 'Building a REST API that powers an app', traits: { programming: 2, logical: 2 } },
    { text: 'Automating a deployment pipeline', traits: { programming: 2, patience: 1, teamwork: 1 } },
    { text: 'Styling a pixel-perfect interface', traits: { programming: 1, creative: 2 } },
  ]},
  { id: 'q10', category: 'Mathematics', question: 'How comfortable are you with mathematics (algebra, statistics, probability)?', options: [
    { text: 'Very comfortable — I enjoy math problems', traits: { mathematics: 3, analytical: 1 } },
    { text: 'Reasonably comfortable, with some effort', traits: { mathematics: 2 } },
    { text: 'I can manage it, but I do not enjoy it', traits: { mathematics: 1 } },
    { text: 'I prefer to avoid math-heavy work', traits: { mathematics: -1, creative: 1 } },
  ]},
  { id: 'q11', category: 'Mathematics', question: 'A dataset has values 4, 8, 15, 16, 23, 42. What is the median?', options: [
    { text: '14.5', traits: { mathematics: 0 } },
    { text: '15.5', traits: { mathematics: 2, analytical: 1 } },
    { text: '16', traits: { mathematics: 0 } },
    { text: '18', traits: { mathematics: 0 } },
  ]},
  { id: 'q12', category: 'Communication', question: 'When explaining something technical to a non-technical person, you:', options: [
    { text: 'Use analogies and simple language naturally', traits: { communication: 3 } },
    { text: 'Can do it, but find it takes real effort', traits: { communication: 2 } },
    { text: 'Prefer to just show them a diagram or demo', traits: { communication: 1, creative: 1 } },
    { text: 'Would rather someone else handle that conversation', traits: { independence: 2 } },
  ]},
  { id: 'q13', category: 'Communication', question: 'In meetings, you tend to:', options: [
    { text: 'Speak up often and drive the discussion', traits: { leadership: 2, communication: 2 } },
    { text: 'Contribute when you have something valuable to add', traits: { communication: 1, analytical: 1 } },
    { text: 'Listen carefully and take detailed notes', traits: { detail: 2, patience: 1 } },
    { text: 'Prefer async updates over live meetings', traits: { independence: 2 } },
  ]},
  { id: 'q14', category: 'Creativity', question: 'How do you feel about design and visual aesthetics?', options: [
    { text: 'I love crafting visuals that feel just right', traits: { creative: 3 } },
    { text: 'I appreciate good design but prefer building logic', traits: { creative: 1, programming: 2 } },
    { text: 'I care more about function than form', traits: { logical: 2, detail: 1 } },
    { text: 'I rarely think about aesthetics', traits: { creative: -1 } },
  ]},
  { id: 'q15', category: 'Creativity', question: 'When starting a new project, you like to:', options: [
    { text: 'Sketch out a novel, unconventional approach', traits: { creative: 2, curiosity: 1 } },
    { text: 'Follow a proven, battle-tested structure', traits: { detail: 2, patience: 1 } },
    { text: 'Research what similar successful projects did', traits: { curiosity: 2, analytical: 1 } },
    { text: 'Get feedback from others before deciding', traits: { teamwork: 2, communication: 1 } },
  ]},
  { id: 'q16', category: 'Analytical Thinking', question: 'You are given a spreadsheet of confusing sales numbers. You:', options: [
    { text: 'Start building charts to spot trends immediately', traits: { analytical: 3, mathematics: 1 } },
    { text: 'Ask what business question we are trying to answer first', traits: { communication: 2, analytical: 1 } },
    { text: 'Clean and organize the data before analyzing', traits: { detail: 2, patience: 1 } },
    { text: 'Delegate the analysis and focus on next steps', traits: { leadership: 2 } },
  ]},
  { id: 'q17', category: 'Analytical Thinking', question: 'When making a decision, you rely most on:', options: [
    { text: 'Data and evidence', traits: { analytical: 3 } },
    { text: 'Gut feeling and intuition', traits: { creative: 2 } },
    { text: 'What worked well before', traits: { patience: 2, detail: 1 } },
    { text: 'What the team collectively agrees on', traits: { teamwork: 2, communication: 1 } },
  ]},
  { id: 'q18', category: 'Preferred Working Style', question: 'Your ideal working environment is:', options: [
    { text: 'Independent, deep-focus work with few interruptions', traits: { independence: 3 } },
    { text: 'Highly collaborative, constantly pairing with others', traits: { teamwork: 3, communication: 1 } },
    { text: 'A mix, depending on the task at hand', traits: { teamwork: 1, independence: 1 } },
    { text: 'Structured, with clear daily routines and checklists', traits: { detail: 2, patience: 1 } },
  ]},
  { id: 'q19', category: 'Preferred Working Style', question: 'You do your best work when:', options: [
    { text: 'There is a clear deadline creating urgency', traits: { leadership: 1, patience: -1 } },
    { text: 'You have unstructured time to explore freely', traits: { curiosity: 2, creative: 1 } },
    { text: 'You are solving a concrete, well-scoped problem', traits: { logical: 2, detail: 1 } },
    { text: 'You are mentoring or helping someone else learn', traits: { communication: 2, teamwork: 1 } },
  ]},
  { id: 'q20', category: 'Favorite Subjects', question: 'Which school/college subject did you enjoy most?', options: [
    { text: 'Mathematics or Statistics', traits: { mathematics: 2, analytical: 1 } },
    { text: 'Computer Science or Programming', traits: { programming: 2, logical: 1 } },
    { text: 'Art, Design, or Literature', traits: { creative: 2, communication: 1 } },
    { text: 'Physics, Chemistry, or Engineering', traits: { analytical: 2, mathematics: 1 } },
  ]},
  { id: 'q21', category: 'Favorite Subjects', question: 'Which of these topics would you pick for a free elective?', options: [
    { text: 'Introduction to Artificial Intelligence', traits: { programming: 2, curiosity: 2, mathematics: 1 } },
    { text: 'Web Development Bootcamp', traits: { programming: 2, creative: 1 } },
    { text: 'Cyber Law & Ethical Hacking', traits: { analytical: 2, detail: 1 } },
    { text: 'Human-Computer Interaction', traits: { creative: 2, communication: 1 } },
  ]},
  { id: 'q22', category: 'Career Preferences', question: 'Which work outcome matters most to you?', options: [
    { text: 'Building things millions of people use', traits: { programming: 1, leadership: 1 } },
    { text: 'Solving deep intellectual puzzles', traits: { analytical: 2, curiosity: 1 } },
    { text: 'Making technology safer for everyone', traits: { detail: 2, patience: 1 } },
    { text: 'Creating delightful user experiences', traits: { creative: 2, communication: 1 } },
  ]},
  { id: 'q23', category: 'Career Preferences', question: 'How important is remote/flexible work to you?', options: [
    { text: 'Very important — independence matters a lot', traits: { independence: 2 } },
    { text: 'I like being in-person with a team often', traits: { teamwork: 2 } },
    { text: "It doesn't matter much to me", traits: {} },
    { text: 'I prefer a hybrid mix', traits: { teamwork: 1, independence: 1 } },
  ]},
  { id: 'q24', category: 'Interests', question: 'You have a free Saturday to learn something new online. You pick a video about:', options: [
    { text: 'How neural networks recognize images', traits: { curiosity: 2, mathematics: 1, programming: 1 } },
    { text: 'How to deploy an app to the cloud', traits: { programming: 2, independence: 1 } },
    { text: 'How to run a penetration test on a website', traits: { analytical: 2, detail: 1 } },
    { text: 'How to design a mobile app users will love', traits: { creative: 2, communication: 1 } },
  ]},
  { id: 'q25', category: 'Aptitude', question: 'You are asked to memorize a random 10-digit number for 30 seconds. Your strategy:', options: [
    { text: 'Break it into chunks and repeat it rhythmically', traits: { logical: 2, patience: 1 } },
    { text: 'Create a visual story to link the digits', traits: { creative: 2 } },
    { text: "Just try to brute-force memorize it", traits: { patience: 1 } },
    { text: 'Write it down instead of memorizing', traits: { detail: 1 } },
  ]},
  { id: 'q26', category: 'Personality', question: 'Your friends would describe you as:', options: [
    { text: 'The planner who keeps everyone organized', traits: { leadership: 2, detail: 1 } },
    { text: 'The curious one always asking "why?"', traits: { curiosity: 2 } },
    { text: 'The calm one who stays patient under pressure', traits: { patience: 2 } },
    { text: 'The creative one with unconventional ideas', traits: { creative: 2 } },
  ]},
  { id: 'q27', category: 'Logical Reasoning', question: 'A train leaves at 3:15 PM and arrives at 6:42 PM. How long was the journey?', options: [
    { text: '3 hours 17 minutes', traits: { logical: 0 } },
    { text: '3 hours 27 minutes', traits: { logical: 2, mathematics: 1 } },
    { text: '3 hours 37 minutes', traits: { logical: 0 } },
    { text: '4 hours 7 minutes', traits: { logical: 0 } },
  ]},
  { id: 'q28', category: 'Problem-Solving', question: 'A project deadline suddenly moved a week earlier. You:', options: [
    { text: 'Immediately re-prioritize and cut non-essential scope', traits: { leadership: 1, analytical: 1 } },
    { text: 'Rally the team and redistribute the workload', traits: { teamwork: 2, communication: 1 } },
    { text: 'Work longer hours independently to catch up', traits: { independence: 2, patience: 1 } },
    { text: 'Push back and negotiate a more realistic timeline', traits: { communication: 2, leadership: 1 } },
  ]},
  { id: 'q29', category: 'Programming Interest', question: 'Debugging a gnarly issue for hours feels:', options: [
    { text: 'Satisfying — I enjoy the hunt', traits: { programming: 2, patience: 2 } },
    { text: 'Frustrating but I push through', traits: { programming: 1, patience: 1 } },
    { text: "Draining — I'd rather ask for help sooner", traits: { teamwork: 1 } },
    { text: 'I try to avoid getting into that situation via planning', traits: { detail: 2 } },
  ]},
  { id: 'q30', category: 'Mathematics', question: 'Probability: you flip a fair coin 3 times. What is the chance of getting exactly 2 heads?', options: [
    { text: '1/8', traits: { mathematics: 0 } },
    { text: '3/8', traits: { mathematics: 2, analytical: 1 } },
    { text: '1/2', traits: { mathematics: 0 } },
    { text: '3/4', traits: { mathematics: 0 } },
  ]},
  { id: 'q31', category: 'Communication', question: 'Writing documentation for your work feels:', options: [
    { text: 'Important — I write it clearly and proactively', traits: { communication: 2, detail: 2 } },
    { text: "Necessary but I'd rather someone else did it", traits: { communication: 1 } },
    { text: 'Tedious — I avoid it when possible', traits: { communication: -1 } },
    { text: 'Enjoyable — I like explaining how things work', traits: { communication: 2, creative: 1 } },
  ]},
  { id: 'q32', category: 'Creativity', question: 'You are more likely to be praised for:', options: [
    { text: 'An elegant, clever solution to a hard problem', traits: { analytical: 2, logical: 1 } },
    { text: 'A beautiful design others compliment', traits: { creative: 2 } },
    { text: 'Reliability — things you own never break', traits: { detail: 2, patience: 1 } },
    { text: 'Bringing the team together around an idea', traits: { leadership: 2, teamwork: 1 } },
  ]},
  { id: 'q33', category: 'Analytical Thinking', question: 'When reading a long technical report, you:', options: [
    { text: 'Skim for the key data points and conclusions', traits: { analytical: 2, curiosity: 1 } },
    { text: 'Read every section carefully in order', traits: { detail: 2, patience: 1 } },
    { text: 'Look for the story/narrative behind the numbers', traits: { communication: 2, creative: 1 } },
    { text: 'Jump straight to the recommendations', traits: { leadership: 1 } },
  ]},
  { id: 'q34', category: 'Preferred Working Style', question: 'How do you feel about ambiguity — tasks with unclear requirements?', options: [
    { text: 'I enjoy defining the problem myself', traits: { independence: 2, creative: 1 } },
    { text: 'I prefer to clarify requirements before starting', traits: { detail: 2, communication: 1 } },
    { text: 'I ask a lot of questions to reduce uncertainty', traits: { communication: 2, analytical: 1 } },
    { text: 'I find ambiguity stressful and avoid it', traits: { patience: -1 } },
  ]},
  { id: 'q35', category: 'Career Preferences', question: 'Five years from now, you would be proudest to say:', options: [
    { text: '"I built an AI system that changed an industry"', traits: { curiosity: 2, mathematics: 1, programming: 1 } },
    { text: '"I led a team that shipped a beloved product"', traits: { leadership: 2, teamwork: 1 } },
    { text: '"I kept critical systems safe and running"', traits: { detail: 2, patience: 1 } },
    { text: '"I designed something people genuinely love using"', traits: { creative: 2, communication: 1 } },
  ]},
];

module.exports = { TRAITS, CAREERS, CAREER_TRAIT_WEIGHTS, ASSESSMENT_QUESTIONS };
