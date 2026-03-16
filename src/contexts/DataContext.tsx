import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { AppData, UserProfile } from '../lib/types'
import { fetchGistBackup } from '../lib/gist'
import { fetchRecipes, fetchShoppingList, fetchMealPlans } from '../lib/firebase'

interface DataState {
  data: AppData | null
  loading: boolean
  error: string | null
  reload: () => Promise<void>
  lastSync: Date | null
}

const DataContext = createContext<DataState | null>(null)

export function DataProvider({
  user,
  token,
  children,
}: {
  user: UserProfile
  token: string
  children: ReactNode
}) {
  const [data, setData] = useState<AppData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastSync, setLastSync] = useState<Date | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Parallel: Gist + Firebase
      const [gistData, recipes, shoppingList, mealPlans] = await Promise.all([
        fetchGistBackup(token, user.gistId),
        fetchRecipes(),
        fetchShoppingList(),
        fetchMealPlans(),
      ])

      setData({
        habits: gistData.data?.habits || [],
        todos: gistData.data?.todos || [],
        todoFolders: gistData.data?.todoFolders || [],
        todoLists: gistData.data?.todoLists || [],
        workouts: gistData.workouts || { templates: [], logs: [] },
        recipes,
        shoppingList,
        mealPlans,
        exportedAt: gistData.exportedAt,
      })
      setLastSync(new Date())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unbekannter Fehler')
    } finally {
      setLoading(false)
    }
  }, [user, token])

  useEffect(() => {
    loadData()
  }, [loadData])

  return (
    <DataContext.Provider value={{ data, loading, error, reload: loadData, lastSync }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}
