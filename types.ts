
export enum Tab {
  DASHBOARD = 'DASHBOARD',
  ROUTINE = 'ROUTINE',
  KNOWLEDGE = 'KNOWLEDGE',
  COMMUNITY = 'COMMUNITY',
  MAPS = 'MAPS',
  PROFILE = 'PROFILE',
  CHAT = 'CHAT' // Nova aba
}

export interface UserSettings {
  notifications: {
    prayers: boolean;
    community: boolean;
    director: boolean;
  };
  theme?: 'light' | 'dark';
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  photoUrl?: string;
  bio?: string;
  level: number;
  currentXP: number;
  nextLevelXP: number;
  streakDays: number;
  spiritualMaturity?: string;
  spiritualFocus?: string; 
  stateOfLife?: string;   
  hasSeenTutorial?: boolean;
  joinedDate: Date;
  lastRoutineUpdate?: Date; // Novo campo para o ciclo de 30 dias
  isPremium?: boolean;
  subscriptionStatus?: 'active' | 'trial' | 'canceled' | 'expired';
  activityHistory?: { date: string; count: number }[];
  patronSaint?: string;
  lastActiveAt?: Date;
  settings?: UserSettings;
}

export interface AuthSession {
  user: UserProfile;
  token: string;
  expiresAt: number;
}

export type RoutineActionType = 'READ_LITURGY' | 'OPEN_MAP' | 'OPEN_COMMUNITY' | 'OPEN_CHAT' | 'OPEN_PLAYER' | 'READ_KNOWLEDGE' | 'NONE';

export interface RoutineItem {
  id: string;
  title: string;
  description: string;
  detailedContent?: string;
  xpReward: number;
  completed: boolean;
  icon: 'rosary' | 'book' | 'cross' | 'candle' | 'sun' | 'heart' | 'shield' | 'moon' | 'church' | 'music';
  timeOfDay: 'morning' | 'afternoon' | 'night' | 'any';
  dayOfWeek: number[]; 
  actionLink?: RoutineActionType; 
}

export interface JournalEntry {
  id: string;
  mood: 'peace' | 'struggle';
  content: string;
  aiReflection?: string;
  bibleVerse?: string;
  createdAt: Date;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface PrayerIntention {
  id: string;
  author: string;
  authorAvatar?: string; // Added field for avatar
  content: string;
  prayingCount: number;
  isPrayedByUser: boolean;
  timestamp: Date;
  category?: 'health' | 'family' | 'grace' | 'vocational' | 'other';
  tags?: string[];
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: Date;
}

export interface CommunityPost {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  imageUrl?: string;
  likesCount: number;
  commentsCount: number;
  isLikedByUser: boolean;
  timestamp: Date;
  type: 'testimony' | 'challenge_update' | 'inspiration' | 'question'; 
  contextTag?: string; 
  comments?: Comment[];
}

export interface LiturgyReading {
  ref: string; 
  text: string; 
}

export interface LiturgyDay {
  date: string;
  liturgicalColor: string;
  season: string;
  saint: string; 
  readings: {
    first: LiturgyReading;
    psalm: LiturgyReading; 
    second?: LiturgyReading; 
    gospel: LiturgyReading;
  };
}

export interface Parish {
  name: string;
  address: string;
  distance?: string;
  location?: { lat: number; lng: number }; 
  rating?: number;
  userRatingsTotal?: number;
  openNow?: boolean;
  url?: string;
  photoUrl?: string;
  directionsUrl?: string;
}

export type ChallengeActionType = 'PRAYER' | 'RELATIONSHIP' | 'SACRIFICE' | 'GENERIC';

export interface DailyTopic {
  day: number;
  title: string;
  description: string;
  action?: string; // Título curto da ação
  actionType?: ChallengeActionType; // Tipo para UI
  actionContent?: string; // Texto longo (ex: a oração inteira, ou instruções passo a passo)
  isCompleted: boolean;
  isLocked: boolean;
  scripture?: string;
  reflection?: string;
  guidedPrayer?: string;
}

export interface CommunityChallenge {
  id: string;
  title: string;
  description: string;
  currentAmount: number;
  targetAmount: number;
  unit: string;
  daysLeft: number;
  seasonColor: string;
  icon: 'cross' | 'heart' | 'star' | 'fire';
  type: 'season' | 'novena' | 'feast';
  startDate: Date;
  endDate: Date;
  status: 'active' | 'upcoming' | 'completed';
  participants: number;
  isUserParticipating?: boolean;
  userContribution: number; 
  recentActivity?: {      
    user: string;
    amount: number;
    timestamp: Date;
  }[];
  dailyTopics?: DailyTopic[];
  currentDay?: number;
  totalDays?: number;
}

export interface OnboardingData {
  name: string;
  email: string; 
  phone: string; 
  password?: string;
  stateOfLife: 'student' | 'single' | 'married' | 'parent' | 'retired'; 
  routineType: 'chaotic' | 'structured' | 'flexible' | 'overwhelmed'; 
  primaryStruggle: 'anxiety' | 'lust' | 'laziness' | 'pride' | 'anger' | 'dryness' | 'ignorance'; 
  bestMoment: 'morning' | 'commute' | 'breaks' | 'night' | 'random'; 
  spiritualGoal: 'peace' | 'truth' | 'discipline' | 'love' | 'healing';
  patronSaint?: 'michael' | 'therese' | 'joseph' | 'mary';
  photoUrl?: string;
}

// Estrutura detalhada para o Feedback Mensal
export interface MonthlyReviewData {
  intensity: 'too_heavy' | 'balanced' | 'too_light';
  consistency: 'low' | 'medium' | 'high'; // O quanto conseguiu cumprir
  likedPractices: string[]; // Ex: ['Rosário', 'Leitura']
  dislikedPractices: string[]; // Ex: ['Meditação Longa']
  newStruggle: string;
  newGoal: string;
  timeAvailabilityChange: 'same' | 'less' | 'more';
}

export interface KnowledgeItem {
  id: string;
  title: string;
  description: string;
  content: string;
  category: 'doctrine' | 'prayer' | 'mass' | 'saints';
  duration: string;
  imageUrl?: string;
  isRead?: boolean;
  status?: 'active' | 'draft' | 'archived';
  publishedAt?: Date;
  videoSuggestion?: {
    title: string;
    url: string;
    channelName: string;
  };
  musicSuggestion?: {
    title: string;
    url: string;
    artist: string;
  };
}

export interface KnowledgeTrack {
  id: string;
  title: string;
  description: string;
  items: KnowledgeItem[];
}

export interface Notification {
  id: string;
  type: 'pray' | 'comment' | 'like' | 'system';
  content: string;
  isRead: boolean;
  createdAt: Date;
  resourceId?: string;
  actorName?: string;
}

export interface LeaderboardEntry {
  id: string;
  userId: string;
  userName: string;
  avatarUrl?: string;
  score: number;
  rank: number;
  badges?: ('top3' | 'streak' | 'veteran')[];
}

export interface LeaderboardData {
  intercessors: LeaderboardEntry[]; 
  pilgrims: LeaderboardEntry[];     
}
