export type Difficulty = "a1" | "a2" | "b1" | "b2" | "c1" | string;
export type SourceStatus = "official" | "editorial" | "draft" | string;

interface ProvenanceFields {
  sourceStatus: SourceStatus;
  sourceNote?: string;
}

export interface ModuleItem extends ProvenanceFields {
  id: string;
  trackId: string;
  title: string;
  description: string;
  order: number;
}

export interface LessonItem extends ProvenanceFields {
  id: string;
  trackId: string;
  moduleId: string;
  order: number;
  title: string;
  objective: string;
  difficulty: Difficulty;
  estimatedMinutes: number;
  tags: string[];
  contentBlocks: Array<{
    type: string;
    items: Array<Record<string, string>>;
  }>;
}

export interface QuizQuestionItem extends ProvenanceFields {
  id: string;
  trackId: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  tags: string[];
  difficulty: Difficulty;
}

export interface QuizModeItem extends ProvenanceFields {
  id: string;
  title: string;
  description: string;
  questionStrategy: {
    trackTag?: string;
    difficulty?: string[] | string;
    mix?: Array<{
      trackTag: string;
      difficulty?: string;
      count: number;
    }>;
  };
  uiHints: {
    recommendedQuestionCount: number;
    recommendedFor: string;
  };
}

export interface FlashcardItem extends ProvenanceFields {
  id: string;
  trackId: string;
  front: string;
  back: string;
  transliteration?: string;
  tags: string[];
  difficulty: Difficulty;
}

export interface FactItem extends ProvenanceFields {
  id: string;
  trackId: string;
  title: string;
  statement: string;
}

export interface TrackSummary {
  id: string;
  title: string;
  description: string;
  lessonCount: number;
  moduleCount: number;
}

export interface HumorItem extends ProvenanceFields {
  id: string;
  trackId: string;
  type: "meme" | "joke" | "anecdote" | string;
  title: string;
  hook: string;
  greek: string;
  transliteration: string;
  translation: string;
  explanation: string;
  humorNote: string;
  cultureAngle: string;
  variants?: Array<{
    title: string;
    greek: string;
    transliteration: string;
  }>;
  tags: string[];
}
