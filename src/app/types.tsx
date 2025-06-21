export interface Achievement {
  id: number
  title: string
  description: string
  category: string
  date: string
  metric: string
  icon: any
  completed: boolean
  completedDate?: string
  type: "achievement" | "goal" // New field to distinguish types
  progress?: number // For goal-type achievements
  target?: string // For goal-type achievements
  deadline?: string // For goal-type achievements
  current?: string // For goal-type achievements
}

export interface UserProfile {
  name: string
  joinDate: string
  avatar?: string
}

export interface DataEntry {
  id: number
  date: string
  categoryId: string
  data: any
  note?: string
}
