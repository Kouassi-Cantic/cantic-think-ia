export interface Persona {
  id: string;
  name?: string;
  role: string;
  goal: string;
  description: string;
  icon: any;
  color: string;
  targetSection: string;
  needs?: string[];
  challenges?: string[];
}

export interface QuoteRequest {
  id: string;
  userEmail: string;
  userName?: string;
  services: {
    serviceId: string;
    serviceName: string;
    budget: number;
  }[];
  totalBudget: number;
  status: 'pending' | 'sent' | 'accepted' | 'rejected';
  quoteUrl?: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface ClientProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  jobTitle?: string;
  company?: string;
  industry?: string;
  bio?: string;
  phone?: string;
  whatsapp?: string;
  facebookPerso?: string;
  facebookPage?: string;
  linkedin?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DigitalResource extends Resource {}

export interface CaseStudy {
  id: string;
  title: string;
  client: string;
  challenge: string;
  solution: string;
  impact: string;
  status: 'Existant' | 'En développement' | 'Phase Pilote';
  logoUrl?: string;
  url?: string;
  tags: string[];
  order: number;
  visualType: 'hero' | 'standard';
  heroShortTitle?: string;
  createdAt?: string;
}

export interface Subscriber {
  id: string;
  email: string;
  createdAt: string;
}

export interface AdminUser {
  id: string;
  email: string;
  role: 'admin' | 'super_admin';
  createdAt: string;
}

export interface Appointment extends BookingRequest {}

export interface Resource {
  id: string;
  title: string;
  description: string;
  price: number;
  type: 'ebook' | 'template' | 'guide' | 'case_study';
  typeLabel?: string;
  previewUrl?: string;
  fileUrl: string;
  category: string;
  tags: string[];
  gradientFrom?: string;
  gradientTo?: string;
  pagesCount?: number;
  targetAudience?: string;
  keyBenefits?: string[];
  badge?: string;
  slug?: string;
  order?: number;
  bonusPdfUrl?: string;
  bonusImageUrl?: string;
  bonusVideoUrl?: string;
  bonusAudioUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  userEmail: string;
  firstName?: string;
  resourceId: string;
  resourceTitle: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  paymentMethod: 'manual_transfer' | 'card' | 'mobile_money';
  referenceNumber?: string;
  paymentProofUrl?: string;
  adminNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TrainingCourse {
  id: string;
  title_professional: string;
  benefit_micro: string;
  level: 'Débutant' | 'Intermédiaire' | 'Avancé' | 'Expert';
  target: string;
  curriculum?: {
    duration: string;
    modules: string[];
  };
  price?: string;
  discountRate?: number;
  totalSeats?: number;
  brochureUrl?: string;
  imageUrl?: string;
  trainingDate?: string;
  location?: string;
  slug?: string;
  createdAt: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  category: string;
  imageUrl: string;
  brochureUrl?: string;
  audioUrl?: string;
  ctaLink?: string;
  ctaLabel?: string;
  date?: string;
  tags: string[];
  reactions: {
    like: number;
    insightful: number;
    love: number;
    pertinent?: number;
    visionnaire?: number;
    actionnable?: number;
  };
  comments: BlogComment[];
  createdAt: string;
  updatedAt: string;
}

export interface BlogComment {
  id: string;
  userId: string;
  userName: string;
  author?: string;
  content: string;
  createdAt: string;
}

export interface AuditResponse {
  id: string;
  userId?: string;
  userEmail: string;
  scores: {
    [category: string]: number;
  };
  totalScore: number;
  recommendations: string[];
  createdAt: string;
}

export interface BookingRequest {
  id: string;
  userName: string;
  userEmail: string;
  clientInstitution?: string;
  date: string;
  time: string;
  service: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  meetingLink?: string;
  createdAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  institution: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied';
  createdAt: string;
}

export interface AuditLog {
  id?: string;
  adminEmail: string;
  adminName: string;
  action: string;
  target: string;
  details?: string;
  createdAt: string;
}
