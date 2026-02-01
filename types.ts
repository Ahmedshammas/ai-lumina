
export enum Difficulty {
  EASY = 'Easy',
  MEDIUM = 'Medium',
  HARD = 'Hard'
}

export interface MCQ {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  difficulty: Difficulty;
  conceptTag: string;
  explanation: string;
}

export interface Concept {
  name: string;
  description: string;
}

export interface SyllabusUnit {
  id: string;
  title: string;
  concepts: Concept[];
}

export interface Syllabus {
  id: string;
  subject: string;
  content: string;
  units: SyllabusUnit[];
  uploadDate: string;
}

export interface KnowledgeGap {
  concept: string;
  missedCount: number;
  lastTested: string;
}

export interface UserProgress {
  syllabusId: string;
  score: number;
  totalAttempted: number;
  currentLevel: Difficulty;
  gaps: KnowledgeGap[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}
