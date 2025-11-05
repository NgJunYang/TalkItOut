// User Roles
export const USER_ROLES = {
  STUDENT: 'student',
  COUNSELOR: 'counselor',
  ADMIN: 'admin',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

// Task Priority & Status
export const TASK_PRIORITY = {
  LOW: 'low',
  MED: 'med',
  HIGH: 'high',
} as const;

export const TASK_STATUS = {
  TODO: 'todo',
  DOING: 'doing',
  DONE: 'done',
} as const;

export type TaskPriority = (typeof TASK_PRIORITY)[keyof typeof TASK_PRIORITY];
export type TaskStatus = (typeof TASK_STATUS)[keyof typeof TASK_STATUS];

// Session Types
export const SESSION_TYPE = {
  POMODORO: 'pomodoro',
  STUDY: 'study',
} as const;

export type SessionType = (typeof SESSION_TYPE)[keyof typeof SESSION_TYPE];

// Sentiment & Risk
export const SENTIMENT = {
  POSITIVE: 'pos',
  NEUTRAL: 'neu',
  NEGATIVE: 'neg',
} as const;

export type Sentiment = (typeof SENTIMENT)[keyof typeof SENTIMENT];

export const RISK_TAGS = {
  SELF_HARM: 'self-harm',
  SEVERE_STRESS: 'severe-stress',
  HARM_TO_OTHERS: 'harm-to-others',
  OVERRELIANCE: 'overreliance',
} as const;

export type RiskTag = (typeof RISK_TAGS)[keyof typeof RISK_TAGS];

export const RISK_SEVERITY = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
} as const;

export type RiskSeverity = (typeof RISK_SEVERITY)[keyof typeof RISK_SEVERITY];

// Risk Flag Status
export const FLAG_STATUS = {
  OPEN: 'open',
  IN_REVIEW: 'in_review',
  RESOLVED: 'resolved',
} as const;

export type FlagStatus = (typeof FLAG_STATUS)[keyof typeof FLAG_STATUS];

// Message Roles
export const MESSAGE_ROLE = {
  USER: 'user',
  ASSISTANT: 'assistant',
} as const;

export type MessageRole = (typeof MESSAGE_ROLE)[keyof typeof MESSAGE_ROLE];

// Crisis Resources
export const CRISIS_MESSAGE = `I'm here to help, but I'm not a crisis service. If you're in immediate danger, call 999. You can also contact Samaritans of Singapore 1767 or SOS CareText 9151 1767.`;

// AI Prompts
export const ASSISTANT_SYSTEM_PROMPT = `You are TalkItOut, a supportive, youth-friendly, non-clinical study companion for learners aged 10–19 in Singapore. You help with time management, goal setting, focus strategies, emotional regulation, and balanced routines. You never diagnose or provide therapy. You encourage healthy breaks, reflection, and reaching out to trusted adults or school counselors. If crisis indicators appear, prepend the configured crisis message. Be empathetic, concise, and encouraging.`;

export const CLASSIFIER_SYSTEM_PROMPT = `You are a sentiment and risk classifier for student support messages. Analyze the text and return a JSON response with:
1. sentiment: MUST be exactly "pos", "neu", or "neg" (these exact strings only)
2. riskTags: array of tags from ["self-harm", "severe-stress", "harm-to-others", "overreliance"]
3. severity: 1 (low), 2 (medium), or 3 (high)

Examples:
- "I'm excited about my math test tomorrow!" → {"sentiment":"pos","riskTags":[],"severity":1}
- "I feel a bit stressed about exams" → {"sentiment":"neu","riskTags":["severe-stress"],"severity":1}
- "I can't handle this anymore, I want to disappear" → {"sentiment":"neg","riskTags":["self-harm","severe-stress"],"severity":3}

Return ONLY valid JSON, no other text.`;

// Defaults
export const DEFAULT_POMODORO = {
  focusDuration: 25,
  breakDuration: 5,
  longBreakDuration: 15,
  cyclesBeforeLongBreak: 4,
};

export const MOOD_RANGE = {
  MIN: 1,
  MAX: 5,
} as const;

// Rate Limiting
export const RATE_LIMITS = {
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  MAX_REQUESTS: 100,
  AI_WINDOW_MS: 60 * 1000, // 1 minute
  AI_MAX_REQUESTS: 10,
} as const;

// Validation
export const VALIDATION = {
  MIN_AGE: 10,
  MAX_AGE: 19,
  MIN_PASSWORD_LENGTH: 8,
  MAX_TASK_TITLE_LENGTH: 200,
  MAX_MESSAGE_LENGTH: 2000,
  MAX_NOTE_LENGTH: 1000,
} as const;
