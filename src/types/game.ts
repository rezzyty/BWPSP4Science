export type ChapterId = 'ch1' | 'ch2' | 'ch3';

export type QuestionType =
  | 'choice'      // S4a_u1_01選擇題_知識
  | 'fill_blank'  // S4a_u1_02填充題_知識
  | 'word_bank'   // S4a_u1_03供詞填充題
  | 'true_false'  // S4a_u1_04判斷題_知識
  | 'matching';   // S4a_u1_07配對題_知識

export interface CharacterGuide {
  id: string;
  name: string;
  englishName: string;
  title: string;
  avatarBg: string;
  avatarBorder: string;
  emoji: string;
  quote: string;
  themeColor: string;
}

export interface ChoiceQuestion {
  id: string;
  chapter: ChapterId;
  type: 'choice';
  exerciseCode: string; // e.g. S4a_u1_01k_001_1
  question: string;
  options: { label: string; text: string }[];
  correctAnswers: string[]; // ['A'] or ['B', 'C', 'D'] for multi-choice
  isMultiSelect?: boolean;
  explanation: string;
  guideCharacterId: string;
  hint: string;
}

export interface FillBlankQuestion {
  id: string;
  chapter: ChapterId;
  type: 'fill_blank';
  exerciseCode: string; // e.g. S4a_u1_02k_001_1
  sentence: string; // contains [___1___], [___2___], etc.
  blanks: {
    index: number;
    acceptableAnswers: string[]; // accepts synonyms like ["二十四", "24"]
    hintWord?: string;
  }[];
  explanation: string;
  guideCharacterId: string;
  hint: string;
}

export interface WordBankQuestion {
  id: string;
  chapter: ChapterId;
  type: 'word_bank';
  exerciseCode: string; // e.g. S4a_u1_03k_001_1
  wordBank: string[]; // pool of words, e.g. ["岩石", "地殼", "地幔", "地核"]
  subQuestions: {
    number: number;
    sentence: string; // contains [___]
    correctWord: string | string[]; // string or array if multiple blanks
  }[];
  explanation: string;
  guideCharacterId: string;
  hint: string;
}

export interface TrueFalseQuestion {
  id: string;
  chapter: ChapterId;
  type: 'true_false';
  exerciseCode: string; // e.g. S4a_u1_04k_001_1
  statement: string;
  isCorrect: boolean; // true = ✓, false = ✗
  explanation: string;
  guideCharacterId: string;
  hint: string;
}

export interface MatchingQuestion {
  id: string;
  chapter: ChapterId;
  type: 'matching';
  exerciseCode: string; // e.g. S4a_u1_07k_001_1
  instruction: string;
  isMultiSelect?: boolean; // multiple options per item
  leftItems: { id: string | number; label: string }[];
  rightOptions: { id: string; text: string }[];
  correctMatches: Record<string | number, string[]>; // e.g. { "1": ["D"], "2": ["A"] }
  explanation: string;
  guideCharacterId: string;
  hint: string;
}

export type QuestionItem =
  | ChoiceQuestion
  | FillBlankQuestion
  | WordBankQuestion
  | TrueFalseQuestion
  | MatchingQuestion;

export interface PowerUpItem {
  id: string;
  name: string;
  icon: string;
  description: string;
  count: number;
  cost: number;
  color: string;
}

export interface UserGameState {
  studentName: string;
  saveCode: string;
  coins: number;
  lives: number;
  stars: number;
  score: number;
  selectedCharacter: string;
  inventory: Record<string, number>; // powerUpId -> count
  completedStages: Record<string, { stars: number; score: number; passedAt: string }>;
  mistakes: string[]; // question IDs of incorrectly answered questions
  activePowerUp: string | null;
  lastUpdated: string;
}
