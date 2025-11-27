
export enum Tab {
  DASHBOARD = 'DASHBOARD',
  ROUTINE = 'ROUTINE',
  KNOWLEDGE = 'KNOWLEDGE', // New Tab replacing MAPS
  CHAT = 'CHAT',
  COMMUNITY = 'COMMUNITY',
  PROFILE = 'PROFILE'
}

export interface UserProfile {
  id: string; // Unique ID
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
  // Subscription Fields
  isPremium?: boolean;
  subscriptionStatus?: 'active' | 'trial' | 'canceled' | 'expired';
  // New: Activity History for Heatmap
  activityHistory?: { date: string; count: number }[];
  patronSaint?: string;
}

// Auth Interface
export interface AuthSession {
  user: UserProfile;
  token: string;
  expiresAt: number;
}

export interface RoutineItem {
  id: string;
  title: string;
  description: string;
  detailedContent?: string;
  xpReward: number;
  completed: boolean;
  icon: 'rosary' | 'book' | 'cross' | 'candle' | 'sun' | 'heart' | 'shield';
  timeEstimate?: string;
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

// NEW: Community Feed Interfaces
export interface CommunityPost {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string; // URL or initial
  content: string;
  imageUrl?: string; // Optional photo
  likesCount: number;
  commentsCount: number;
  isLikedByUser: boolean;
  timestamp: Date;
  type: 'testimony' | 'challenge_update' | 'inspiration';
  comments?: Comment[]; // Added comments array
}

export interface LiturgyDay {
  date: string;
  liturgicalColor: string;
  season: string;
  readings: {
    first: string;
    psalm: string;
    gospel: string;
  };
  saint: string;
}

export interface Parish {
  name: string;
  address: string;
  neighborhood?: string; // Deprecated/Optional
  distance?: string; // Calculated string
  location?: { lat: number; lng: number }; 
  rating?: number;
  userRatingsTotal?: number;
  openNow?: boolean;
  url?: string;
  photoUrl?: string; // NEW: Real photo from Google
  directionsUrl?: string;
}

// NEW: Daily Topic for Liturgical Journey
export interface DailyTopic {
  day: number;
  title: string;
  description: string; // Short meditation
  action?: string; // New: Practical action (e.g. "Call your mother")
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
  // New Fields for Journey
  dailyTopics?: DailyTopic[];
  currentDay?: number;
  totalDays?: number;
}

export interface OnboardingData {
  name: string;
  email: string; 
  phone: string; 
  password?: string; // Added password for account creation
  stateOfLife: 'student' | 'single' | 'married' | 'parent' | 'retired'; 
  routineType: 'chaotic' | 'structured' | 'flexible' | 'overwhelmed'; 
  primaryStruggle: 'anxiety' | 'lust' | 'laziness' | 'pride' | 'anger' | 'dryness' | 'ignorance'; 
  bestMoment: 'morning' | 'commute' | 'breaks' | 'night' | 'random'; 
  spiritualGoal: 'peace' | 'truth' | 'discipline' | 'love' | 'healing';
  patronSaint?: 'michael' | 'therese' | 'joseph' | 'mary';
  photoUrl?: string;
}

// Knowledge Base Interfaces
export interface KnowledgeItem {
  id: string;
  title: string;
  description: string;
  content: string; // Markdown content
  category: 'doctrine' | 'prayer' | 'mass' | 'saints';
  duration: string; // e.g. "3 min"
  imageUrl?: string;
  isRead?: boolean;
}

export interface KnowledgeTrack {
  id: string;
  title: string;
  description: string;
  items: KnowledgeItem[];
}
