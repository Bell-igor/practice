import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type {
  AppState,
  Application,
  ApplicationStatus,
  CaseItem,
  PortfolioItem,
  Role,
  User,
} from '../types'
import { createSeedState } from '../data/seed'

const STORAGE_KEY = 'stupen.state.v2'
const THEME_KEY = 'stupen.theme'

export type ToastTone = 'success' | 'error' | 'info'
export interface Toast {
  id: string
  message: string
  tone: ToastTone
}

export type CaseDraft = Omit<CaseItem, 'id' | 'employerId' | 'createdAt' | 'views' | 'status'> & {
  id?: string
}

interface RegisterData {
  role: Role
  name: string
  email: string
  password: string
  company?: string
  university?: string
}

interface Result {
  ok: boolean
  error?: string
}

interface AppContextValue {
  state: AppState
  currentUser: User | null
  theme: 'light' | 'dark'
  toasts: Toast[]
  notify: (message: string, tone?: ToastTone) => void
  dismissToast: (id: string) => void
  toggleTheme: () => void
  login: (email: string, password: string) => Result
  loginAs: (role: Role) => void
  register: (data: RegisterData) => Result
  logout: () => void
  toggleFavorite: (caseId: string) => void
  isFavorite: (caseId: string) => boolean
  apply: (caseId: string, message: string) => Result
  setApplicationStatus: (id: string, status: ApplicationStatus) => void
  saveCase: (draft: CaseDraft) => Result & { id?: string }
  deleteCase: (id: string) => void
  updateProfile: (patch: Partial<User>) => void
  addPortfolioItem: (item: Omit<PortfolioItem, 'id'>) => void
  removePortfolioItem: (id: string) => void
  resetDemo: () => void
  viewCase: (id: string) => void
  getUser: (id: string) => User | undefined
  getCase: (id: string) => CaseItem | undefined
  getApplicationsForCase: (caseId: string) => Application[]
  getMyCaseIds: () => string[]
}

const AppContext = createContext<AppContextValue | null>(null)

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as AppState
      if (parsed && Array.isArray(parsed.users) && Array.isArray(parsed.cases)) {
        return parsed
      }
    }
  } catch {
    /* повреждённое хранилище — пересоздаём демо-данные */
  }
  return createSeedState()
}

function loadTheme(): 'light' | 'dark' {
  try {
    const stored = localStorage.getItem(THEME_KEY)
    if (stored === 'dark' || stored === 'light') return stored
    if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) return 'dark'
  } catch {
    /* игнорируем */
  }
  return 'light'
}

function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-3)}`
}

const AVATAR_COLORS = ['#2b5ce6', '#0e7fa8', '#0c8a6c', '#c9820c', '#475569', '#155e75', '#6366f1']

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(loadState)
  const [theme, setTheme] = useState<'light' | 'dark'>(loadTheme)
  const [toasts, setToasts] = useState<Toast[]>([])
  const viewed = useRef<Set<string>>(new Set())

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      /* переполнение хранилища не должно ломать приложение */
    }
  }, [state])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      localStorage.setItem(THEME_KEY, theme)
    } catch {
      /* игнорируем */
    }
  }, [theme])

  const notify = useCallback((message: string, tone: ToastTone = 'success') => {
    const id = uid('t')
    setToasts((prev) => [...prev, { id, message, tone }])
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4200)
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const currentUser = useMemo(
    () => state.users.find((u) => u.id === state.currentUserId) ?? null,
    [state.users, state.currentUserId],
  )

  const getUser = useCallback(
    (id: string) => state.users.find((u) => u.id === id),
    [state.users],
  )

  const getCase = useCallback(
    (id: string) => state.cases.find((c) => c.id === id),
    [state.cases],
  )

  const login = useCallback(
    (email: string, password: string): Result => {
      const normalized = email.trim().toLowerCase()
      const user = state.users.find((u) => u.email.toLowerCase() === normalized)
      if (!user) return { ok: false, error: 'Аккаунт с таким e-mail не найден' }
      if (user.password !== password) return { ok: false, error: 'Неверный пароль' }
      setState((prev) => ({ ...prev, currentUserId: user.id }))
      return { ok: true }
    },
    [state.users],
  )

  const loginAs = useCallback(
    (role: Role) => {
      const demo = role === 'student'
        ? state.users.find((u) => u.email === 'student@stupen.ru')
        : state.users.find((u) => u.email === 'hr@datacraft.ru')
      if (!demo) return
      setState((prev) => ({ ...prev, currentUserId: demo.id }))
    },
    [state.users],
  )

  const register = useCallback(
    (data: RegisterData): Result => {
      const email = data.email.trim().toLowerCase()
      if (!email.includes('@')) return { ok: false, error: 'Укажите корректный e-mail' }
      if (data.password.length < 6) return { ok: false, error: 'Пароль должен быть не короче 6 символов' }
      if (!data.name.trim()) return { ok: false, error: 'Укажите имя' }
      if (state.users.some((u) => u.email.toLowerCase() === email)) {
        return { ok: false, error: 'Аккаунт с таким e-mail уже существует' }
      }
      const user: User = {
        id: uid('u'),
        role: data.role,
        name: data.name.trim(),
        email,
        password: data.password,
        avatarColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
        createdAt: new Date().toISOString(),
        ...(data.role === 'student'
          ? { portfolio: [], skills: [] }
          : { company: data.company?.trim() || data.name.trim() }),
      }
      setState((prev) => ({ ...prev, users: [...prev.users, user], currentUserId: user.id }))
      return { ok: true }
    },
    [state.users],
  )

  const logout = useCallback(() => {
    setState((prev) => ({ ...prev, currentUserId: null }))
  }, [])

  const toggleFavorite = useCallback(
    (caseId: string) => {
      setState((prev) => {
        if (!prev.currentUserId) return prev
        const exists = prev.favorites.some(
          (f) => f.userId === prev.currentUserId && f.caseId === caseId,
        )
        return {
          ...prev,
          favorites: exists
            ? prev.favorites.filter(
                (f) => !(f.userId === prev.currentUserId && f.caseId === caseId),
              )
            : [...prev.favorites, { userId: prev.currentUserId, caseId }],
        }
      })
    },
    [],
  )

  const isFavorite = useCallback(
    (caseId: string) =>
      Boolean(
        currentUser &&
          state.favorites.some((f) => f.userId === currentUser.id && f.caseId === caseId),
      ),
    [currentUser, state.favorites],
  )

  const apply = useCallback(
    (caseId: string, message: string): Result => {
      if (!currentUser) return { ok: false, error: 'Войдите, чтобы откликнуться' }
      if (currentUser.role !== 'student') return { ok: false, error: 'Откликаться могут только студенты' }
      const target = state.cases.find((c) => c.id === caseId)
      if (!target) return { ok: false, error: 'Кейс не найден' }
      if (target.employerId === currentUser.id) return { ok: false, error: 'Это ваш собственный кейс' }
      if (
        state.applications.some((a) => a.caseId === caseId && a.studentId === currentUser.id)
      ) {
        return { ok: false, error: 'Вы уже откликнулись на этот кейс' }
      }
      const application: Application = {
        id: uid('a'),
        caseId,
        studentId: currentUser.id,
        message: message.trim(),
        status: 'pending',
        createdAt: new Date().toISOString(),
      }
      setState((prev) => ({ ...prev, applications: [...prev.applications, application] }))
      return { ok: true }
    },
    [currentUser, state.applications, state.cases],
  )

  const setApplicationStatus = useCallback((id: string, status: ApplicationStatus) => {
    setState((prev) => ({
      ...prev,
      applications: prev.applications.map((a) => (a.id === id ? { ...a, status } : a)),
    }))
  }, [])

  const saveCase = useCallback(
    (draft: CaseDraft): Result & { id?: string } => {
      if (!currentUser || currentUser.role !== 'employer') {
        return { ok: false, error: 'Размещать кейсы могут только работодатели' }
      }
      if (draft.id) {
        const existing = state.cases.find((c) => c.id === draft.id)
        if (!existing) return { ok: false, error: 'Кейс не найден' }
        if (existing.employerId !== currentUser.id) {
          return { ok: false, error: 'Можно редактировать только свои кейсы' }
        }
        const updated: CaseItem = { ...existing, ...draft, id: existing.id }
        setState((prev) => ({
          ...prev,
          cases: prev.cases.map((c) => (c.id === updated.id ? updated : c)),
        }))
        return { ok: true, id: updated.id }
      }
      const created: CaseItem = {
        ...(draft as Omit<CaseItem, 'id' | 'employerId' | 'createdAt' | 'views' | 'status'>),
        id: uid('c'),
        employerId: currentUser.id,
        createdAt: new Date().toISOString(),
        views: 0,
        status: 'published',
      }
      setState((prev) => ({ ...prev, cases: [created, ...prev.cases] }))
      return { ok: true, id: created.id }
    },
    [currentUser, state.cases],
  )

  const deleteCase = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      cases: prev.cases.filter((c) => c.id !== id),
      applications: prev.applications.filter((a) => a.caseId !== id),
      favorites: prev.favorites.filter((f) => f.caseId !== id),
    }))
  }, [])

  const updateProfile = useCallback(
    (patch: Partial<User>) => {
      setState((prev) => {
        if (!prev.currentUserId) return prev
        return {
          ...prev,
          users: prev.users.map((u) =>
            u.id === prev.currentUserId ? { ...u, ...patch, id: u.id, role: u.role } : u,
          ),
        }
      })
    },
    [],
  )

  const addPortfolioItem = useCallback((item: Omit<PortfolioItem, 'id'>) => {
    setState((prev) => {
      if (!prev.currentUserId) return prev
      return {
        ...prev,
        users: prev.users.map((u) =>
          u.id === prev.currentUserId
            ? { ...u, portfolio: [{ ...item, id: uid('p') }, ...(u.portfolio ?? [])] }
            : u,
        ),
      }
    })
  }, [])

  const removePortfolioItem = useCallback((id: string) => {
    setState((prev) => {
      if (!prev.currentUserId) return prev
      return {
        ...prev,
        users: prev.users.map((u) =>
          u.id === prev.currentUserId
            ? { ...u, portfolio: (u.portfolio ?? []).filter((p) => p.id !== id) }
            : u,
        ),
      }
    })
  }, [])

  const resetDemo = useCallback(() => {
    const fresh = createSeedState()
    setState(fresh)
    viewed.current.clear()
  }, [])

  const viewCase = useCallback((id: string) => {
    if (viewed.current.has(id)) return
    viewed.current.add(id)
    setState((prev) => ({
      ...prev,
      cases: prev.cases.map((c) => (c.id === id ? { ...c, views: c.views + 1 } : c)),
    }))
  }, [])

  const getApplicationsForCase = useCallback(
    (caseId: string) => state.applications.filter((a) => a.caseId === caseId),
    [state.applications],
  )

  const getMyCaseIds = useCallback(
    () => state.cases.filter((c) => c.employerId === currentUser?.id).map((c) => c.id),
    [state.cases, currentUser],
  )

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === 'light' ? 'dark' : 'light'))
  }, [])

  const value: AppContextValue = {
    state,
    currentUser,
    theme,
    toasts,
    notify,
    dismissToast,
    toggleTheme,
    login,
    loginAs,
    register,
    logout,
    toggleFavorite,
    isFavorite,
    apply,
    setApplicationStatus,
    saveCase,
    deleteCase,
    updateProfile,
    addPortfolioItem,
    removePortfolioItem,
    resetDemo,
    viewCase,
    getUser,
    getCase,
    getApplicationsForCase,
    getMyCaseIds,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
