export interface Profile {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  created_at: string;
  updated_at: string;
}

type ProfileRef = Pick<Profile, 'id' | 'name' | 'avatar'>;

export interface Question {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  created_at: string;
  updated_at?: string;
  profiles?: ProfileRef | ProfileRef[];
  answer_count?: number;
}

export interface Answer {
  id: string;
  question_id: string;
  user_id: string;
  answer: string;
  created_at: string;
  updated_at?: string;
  profiles?: ProfileRef | ProfileRef[];
}

export interface Meeting {
  id: string;
  host_user_id: string;
  title: string;
  description: string | null;
  category: string;
  meeting_link: string;
  scheduled_at: string;
  is_premium: boolean;
  created_at: string;
  profiles?: ProfileRef | ProfileRef[];
  participant_count?: number;
}

export interface MeetingParticipant {
  id: string;
  meeting_id: string;
  user_id: string;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan: 'free' | 'premium';
  status: 'active' | 'cancelled' | 'expired';
  start_date: string;
  end_date: string | null;
  created_at: string;
}

export interface UserActivity {
  id: string;
  user_id: string;
  activity_type: 'ask_question' | 'answer_question' | 'join_meeting';
  activity_date: string;
  created_at: string;
}

export const CATEGORIES = [
  'Java',
  'DSA',
  'Web Development',
  'HTML/CSS',
  'JavaScript',
  'Backend',
  'Database',
  'Other',
] as const;

export type Category = (typeof CATEGORIES)[number];
