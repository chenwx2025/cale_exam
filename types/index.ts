// 类型定义文件

export type CategoryType = 'organization' | 'content' | 'review'

export type QuestionType = 'multiple_choice' | 'true_false' | 'case_study'

export type DifficultyLevel = 'easy' | 'medium' | 'hard'

export interface Category {
  id: string
  name: string
  code: string
  type: CategoryType
  description: string | null
  parentId: string | null
  order: number
  createdAt: Date
  updatedAt: Date
  _count?: {
    questions: number
  }
  children?: Category[]
  parent?: Category | null
}

export interface Question {
  id: string
  type: QuestionType
  question: string
  options: string | null
  correctAnswer: string
  explanation: string | null
  difficulty: DifficultyLevel
  categoryId: string
  tags: string | null
  source: string | null
  createdAt: Date
  updatedAt: Date
  category?: {
    id: string
    name: string
    code: string
    type: CategoryType
    parent?: {
      id: string
      name: string
      code: string
    } | null
  }
}

export interface User {
  id: string
  name: string
  email: string | null
  createdAt: Date
  updatedAt: Date
}

export interface UserAnswer {
  id: string
  userId: string
  questionId: string
  userAnswer: string
  isCorrect: boolean
  timeSpent: number | null
  attemptCount: number
  createdAt: Date
}

export interface StudyPlan {
  id: string
  userId: string
  name: string
  description: string | null
  startDate: Date
  endDate: Date
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface StudyPlanItem {
  id: string
  studyPlanId: string
  questionId: string
  scheduledFor: Date
  completed: boolean
  completedAt: Date | null
  notes: string | null
  createdAt: Date
  updatedAt: Date
}

// API 响应类型
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface UploadResult {
  message: string
  results: {
    success: number
    failed: number
    errors: string[]
  }
}

export interface UserStats {
  overall: {
    total: number
    correct: number
    accuracy: string
  }
  byCategory: Array<{
    categoryName: string
    categoryCode: string
    categoryType: CategoryType
    total: number
    correct: number
    accuracy: string
  }>
}

// 表单类型
export interface CategoryForm {
  name: string
  code: string
  type: CategoryType
  description: string
  parentId?: string
  order?: number
}

export interface QuestionForm {
  type: QuestionType
  question: string
  options?: string
  correctAnswer: string
  explanation?: string
  difficulty: DifficultyLevel
  categoryId: string
  tags?: string
  source?: string
}

export interface StudyPlanForm {
  name: string
  description?: string
  startDate: string
  endDate: string
  questionsPerDay: number
  focusCategory?: string
}

export interface ExamConfig {
  questionCount: number
  difficulty: DifficultyLevel | ''
  categoryType: CategoryType | ''
}

export interface ExamResult {
  total: number
  correct: number
  wrong: number
  accuracy: number
  score: number
}

// Excel 导入行数据类型
export interface ExcelRowData {
  question: string
  categoryCode: string
  correctAnswer: string
  options?: string
  explanation?: string
  difficulty?: DifficultyLevel
  type?: QuestionType
  tags?: string
  source?: string
}

// 组件 Props 类型
export interface QuestionCardProps {
  question: Question
  showAnswer: boolean
}

export interface QuestionCardEmits {
  answer: [value: {
    userAnswer: string
    isCorrect: boolean
    timeSpent: number
  }]
}
