export interface Player {
  id: number;
  username: string;
  email?: string;
  level: number;
  experience: number;
  credits: number;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlayerStats {
  totalGamesPlayed: number;
  totalScore: number;
  averageScore: number;
  bestScore: number;
  correctAnswers: number;
  totalQuestions: number;
  accuracy: number;
  currentStreak: number;
  bestStreak: number;
  cardsCollected: number;
  battlesWon: number;
  battlesLost: number;
  planetsVisited: number;
  artifactsFound: number;
}

export interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  category: 'quiz' | 'collection' | 'battle' | 'exploration';
  requirement: number;
  reward: {
    credits?: number;
    experience?: number;
    cards?: number[];
  };
  unlockedAt?: Date;
}

export interface PlayerProgress {
  currentLevel: number;
  currentExperience: number;
  experienceToNextLevel: number;
  unlockedFeatures: string[];
  achievements: Achievement[];
}

export class PlayerService {
  static calculateLevel(experience: number): number {
    return Math.floor(Math.sqrt(experience / 100)) + 1;
  }

  static calculateExperienceForLevel(level: number): number {
    return Math.pow(level - 1, 2) * 100;
  }

  static calculateExperienceToNextLevel(currentExperience: number): number {
    const currentLevel = this.calculateLevel(currentExperience);
    const nextLevelExperience = this.calculateExperienceForLevel(currentLevel + 1);
    return nextLevelExperience - currentExperience;
  }
}
