
export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE'
}

export enum Platform {
  YOUTUBE = 'YouTube',
  INSTAGRAM = 'Instagram',
  FREELANCE = 'Freelance',
  OTHER = 'Other'
}

export enum ProjectType {
  THUMBNAIL = 'Thumbnail',
  VIDEO_EDITING = 'Video Editing',
  GRAPHIC_DESIGN = 'Graphic Design',
  CONSULTATION = 'Consultation'
}

export interface Client {
  id: string;
  userId: string;
  name: string;
  platform: Platform;
  projectType: ProjectType;
  notes: string;
  createdAt: number;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
  note: string;
  clientId?: string;
}

export interface Credential {
  id: string;
  userId: string;
  platformName: string;
  loginName: string;
  password: string;
  notes: string;
  createdAt: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: 'editor' | 'moderator' | 'owner';
  approved: boolean;
  username?: string;
  location?: string;
  software?: string;
  portfolioLink?: string;
  contact?: string;
}

export interface Task {
  id: string;
  taskNumber: string;
  name: string;
  deadline: string;
  status: 'pending' | 'in-progress' | 'completed' | 'approved' | 'rejected';
  rawFileLink: string;
  editedFileLink?: string;
  assignedTo: string;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface Meeting {
  id: string;
  title: string;
  date: string;
  time: string;
  attendees: string[];
  description?: string;
  meetingLink?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: string;
  type: 'text';
}

export interface PayoutRequest {
  id: string;
  editorId: string;
  projectName: string;
  editedLink: string;
  amount: number;
  paymentMethod: string;
  status: 'pending' | 'approved' | 'paid' | 'rejected';
  requestedAt: string;
}

export interface Application {
  id: string;
  fullName: string;
  software: string;
  role: string;
  portfolioLink: string;
  contact: string;
  email: string;
  location: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedAt: string;
}

export interface FinancialStats {
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
}

export interface AIInsight {
  type: 'TIP' | 'WARNING' | 'PREDICTION';
  message: string;
  value?: string;
}
