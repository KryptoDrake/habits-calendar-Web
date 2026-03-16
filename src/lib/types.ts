// ============ Auth ============
export interface UserProfile {
  id: 'musa' | 'melissa'
  name: string
  gistId: string
}

// ============ Habits ============
export interface HabitReminder {
  id: string
  time: string
  minutesBefore?: number
  notificationId?: string
}

export interface HabitNote {
  date: string
  text: string
}

export interface HabitCategory {
  id: string
  name: string
  icon: string
  color: string
}

export interface Habit {
  id: string
  title: string
  days: number[]
  doneDates: string[]
  reminders?: HabitReminder[]
  notes?: HabitNote[]
  categoryId?: string
  targetPerDay?: number
  startDate?: string
  endDate?: string
  archivedAt?: number
  sortOrder?: number
}

// ============ Todos ============
export interface Subtask {
  id: string
  title: string
  done: boolean
}

export interface Reminder {
  id: string
  type: 'minute' | 'hour' | 'day' | 'week' | 'month'
  value: number
  notificationId?: string
}

export interface Todo {
  id: string
  title: string
  date: string
  time?: string
  done: boolean
  priority?: 'none' | 'low' | 'medium' | 'high'
  flagged?: boolean
  subtasks?: Subtask[]
  reminders?: Reminder[]
  estimatedMinutes?: number
  recurrence?: 'daily' | 'weekly' | 'monthly' | 'none'
  listId: string
  notes?: string
  deletedAt?: number
}

export interface TodoFolder {
  id: string
  title: string
  listIds: string[]
  sortOrder?: number
}

export interface TodoList {
  id: string
  title: string
  sortOrder?: number
}

// ============ Workouts ============
export interface ExerciseSet {
  weight?: number
  reps?: number
  done: boolean
}

export interface WorkoutExercise {
  id: string
  name: string
  exerciseType?: 'strength' | 'cardio'
  sets: ExerciseSet[]
  restSeconds?: number
  durationMinutes?: number
  calories?: number
  distanceKm?: number
}

export interface WorkoutTemplate {
  id: string
  name: string
  exercises: WorkoutExercise[]
}

export interface WorkoutLog {
  id: string
  templateId: string
  date: string
  startedAt: number
  completedAt?: number
  exercises: WorkoutExercise[]
}

// ============ Backup ============
export interface GistBackupData {
  exportedAt: number
  data: {
    habits: Habit[]
    todos: Todo[]
    todoFolders: TodoFolder[]
    todoLists: TodoList[]
  }
  settings?: Record<string, unknown>
  workouts?: {
    templates: WorkoutTemplate[]
    logs: WorkoutLog[]
  }
}

// ============ Essen (Firebase) ============
export interface Ingredient {
  name: string
  amount?: number
  unit?: string
  category?: string
}

export interface RecipeStep {
  text: string
  order: number
}

export interface RecipePhoto {
  uri: string
  timestamp: number
}

export type MealType = 'fruehstueck' | 'mittagessen' | 'abendessen' | 'snack'

export interface Recipe {
  id: string
  title: string
  category: 'zuhause' | 'auswaerts'
  ingredients: Ingredient[]
  prepSteps: RecipeStep[]
  cookingSteps: RecipeStep[]
  photos: RecipePhoto[]
  mealTypes?: MealType[]
  cuisine?: string
  difficulty?: 'einfach' | 'mittel' | 'schwer'
  rating?: number
  isFavorite?: boolean
  cookCount?: number
  lastCooked?: number
  tags?: string[]
  syncedAt?: number
}

export interface PlannedMeal {
  recipeId?: string
  recipeName: string
  notes?: string
}

export interface MealPlanDay {
  date: string
  weekday: string
  meals: {
    fruehstueck?: PlannedMeal[]
    mittagessen?: PlannedMeal[]
    abendessen?: PlannedMeal[]
    snack?: PlannedMeal[]
  }
}

export interface MealPlan {
  id: string
  weekStart: string
  days: MealPlanDay[]
}

export interface ShoppingItem {
  id: string
  name: string
  amount?: number
  unit?: string
  checked: boolean
  recipeId?: string
  recipeName?: string
  addedAt: number
  category?: string
}

// ============ App State ============
export interface AppData {
  habits: Habit[]
  todos: Todo[]
  todoFolders: TodoFolder[]
  todoLists: TodoList[]
  workouts: {
    templates: WorkoutTemplate[]
    logs: WorkoutLog[]
  }
  recipes: Recipe[]
  shoppingList: ShoppingItem[]
  mealPlans: MealPlan[]
  exportedAt: number
}
