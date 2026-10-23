export type Role = 'student' | 'employer'

/** тип opportunity */
export type CaseType = 'internship' | 'practice' | 'coursework' | 'diploma' | 'project'

export type WorkFormat = 'remote' | 'office' | 'hybrid'

export type RewardType = 'money' | 'offer' | 'gift' | 'none'

export type ApplicationStatus = 'pending' | 'review' | 'accepted' | 'rejected'

export type CaseStatus = 'published' | 'draft' | 'closed'

export interface PortfolioItem {
  id: string
  title: string
  description: string
  link?: string
  year: number
  caseId?: string
}

export interface User {
  id: string
  role: Role
  name: string
  email: string
  password: string
  avatarColor: string
  createdAt: string

  /* ——— студент ——— */
  university?: string
  specialty?: string
  studyYear?: string
  city?: string
  about?: string
  skills?: string[]
  telegram?: string
  portfolio?: PortfolioItem[]
  resumeUrl?: string

  /* ——— работодатель ——— */
  company?: string
  position?: string
  industry?: string
  website?: string
  companySize?: string
  companyAbout?: string
}

export interface Reward {
  type: RewardType
  amount?: number
  note: string
}

export interface CaseItem {
  id: string
  employerId: string
  title: string
  type: CaseType
  direction: string
  format: WorkFormat
  city: string
  summary: string
  description: string
  tasks: string[]
  requirements: string[]
  skills: string[]
  duration: string
  deadline: string
  slots: number
  reward: Reward
  status: CaseStatus
  createdAt: string
  views: number
  featured?: boolean
  mentor?: string
  /** что получит студент, кроме вознаграждения */
  outcomes: string[]
}

export interface Application {
  id: string
  caseId: string
  studentId: string
  message: string
  status: ApplicationStatus
  createdAt: string
}

export interface Favorite {
  userId: string
  caseId: string
}

export interface AppState {
  users: User[]
  cases: CaseItem[]
  applications: Application[]
  favorites: Favorite[]
  currentUserId: string | null
  version: number
}
