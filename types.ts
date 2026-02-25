
export type Role = 'student' | 'teacher';

export interface Profile {
  id: string;
  username: string;
  avatar_url?: string;
  role: Role;
  total_points: number;
  total_trophies: number;
  created_at?: string; // Kayıt tarihi
  banned?: boolean; // Yasaklı durumu (Kara liste)
}

export interface TeacherClass {
  id: string;
  name: string;
  teacher_id: string;
  students: { 
    id: string; 
    username: string; 
    avatar_url: string;
    total_points?: number;
    total_trophies?: number;
    banned?: boolean;
    status?: 'pending' | 'approved'; // New field for join requests
  }[];
}

export type QuestionType = 'multiple-choice' | 'text' | 'estimation';

export interface Question {
  id: string;
  text: string;
  options?: string[]; // For multiple choice
  correctAnswer: string;
  type: QuestionType;
  duration?: number; // Optional now, controlled by room settings
}

export interface Category {
  id: string;
  name: string;
  owner_id: string;
  questions: Question[];
  mode: QuestionType;
}

export interface Room {
  id: string;
  code: string;
  host_id: string;
  status: 'waiting' | 'playing' | 'finished';
  current_question_index: number;
  players: RoomPlayer[];
  settings: {
    questionCount: number;
    category_id: string;
    timePerQuestion: number;
  };
}

export interface RoomPlayer {
  id: string;
  username: string;
  avatar_url?: string;
  score: number;
  is_host: boolean;
  last_answer_correct?: boolean | null; // Track round status
  last_answer_val?: string; // Track what they wrote (optional)
}