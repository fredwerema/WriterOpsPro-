export enum UserRole {
  ADMIN = 'admin',
  WRITER = 'writer',
  GUEST = 'guest'
}

export enum TaskStatus {
  OPEN = 'open',
  ASSIGNED = 'assigned',
  REVIEW = 'review',
  COMPLETED = 'completed',
  REJECTED = 'rejected'
}

export const JOB_CATEGORIES = [
  "Content Writing",
  "Academic Writing",
  "Transcription",
  "Graphic Design",
  "Data Entry",
  "Web Development",
  "Video Editing",
  "Translation",
  "Virtual Assistant",
  "Social Media"
];

export interface Profile {
  id: string;
  email: string;
  phone_number?: string;
  role: UserRole;
  tier?: 'Basic' | 'Pro' | 'Elite';
  is_active: boolean;
  wallet_balance_cents: number;
}

export interface Task {
  id: string;
  title: string;
  category: string;
  description: string;
  price_cents: number;
  status: TaskStatus;
  assigned_to?: string; // profile id
  deadline: string; // ISO string
  created_at: string; // ISO string
  submission_url?: string;
  submission_notes?: string;
}

export interface Bid {
  id: string;
  task_id: string;
  user_id: string;
  amount_cents: number;
  proposal: string;
  created_at: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface Transaction {
  id: string;
  user_id: string;
  type: 'activation_fee' | 'payout' | 'withdrawal' | 'subscription';
  amount_cents: number;
  mpesa_reference: string;
  status: 'pending' | 'complete' | 'failed';
  date: string;
}

export interface AuthState {
  user: Profile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}