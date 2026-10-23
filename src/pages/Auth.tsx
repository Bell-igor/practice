import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowRight,
  BadgeCheck,
  Briefcase,
  CheckCircle2,
  GraduationCap,
  Info,
  Lock,
  Mail,
  Sparkles,
  UserRound,
} from 'lucide-react'
import { useApp } from '../store/AppStore'
import { Field } from '../components/ui'
import type { Role } from '../types'

const PROMO = [
  'Каталог реальных задач с оплатой',
  'Стажировки и темы для курсовых и дипломов',
  'Портфолио, которое можно показать',
  'Оффер по итогам проекта',
]

export default function Auth({ mode }: { mode: 'login' | 'register' }) {
  const { login, register, loginAs, currentUser, notify } = useApp()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const next = params.get('next') ?? '/dashboard'
  const initialRole = params.get('role') === 'employer' ? 'employer' : 'student'

  const [role, setRole] = useState<Role>(initialRole as Role)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [company, setCompany] = useState('')
  const [university, setUniversity] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (currentUser) navigate(next, { replace: true })
  }, [currentUser, navigate, next])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setBusy(true)

    if (mode === 'login') {
      const res = login(email, password)
      setBusy(false)
      if (!res.ok) {
        setError(res.error ?? 'Не удалось войти')
        return
      }
      notify('С возвращением!')
      navigate(next, { replace: true })
      return
    }

    const res = register({ role, name, email, password, company, university })
    setBusy(false)
    if (!res.ok) {
      setError(res.error ?? 'Не удалось создать аккаунт')
      return
    }
    notify('Аккаунт создан — добро пожаловать на Ступень')
    navigate('/dashboard', { replace: true })
  }

  const quickLogin = (r: Role) => {
    loginAs(r)
    notify(r === 'student' ? 'Вы вошли как студент (демо)' : 'Вы вошли как работодатель (демо)', 'info')
    navigate('/dashboard', { replace: true })
  }

  return (
    <div className="auth">
      <div className="auth__panel auth__promo">
        <Link to="/" className="logo" style={{ color: '#fff', marginBottom: 40 }}>
          <span className="logo__mark">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="3" y="14" width="5" height="7" rx="1.5" fill="#fff" opacity=".55" />
              <rect x="9.5" y="9" width="5" height="12" rx="1.5" fill="#fff" opacity=".8" />
              <rect x="16" y="3" width="5" height="18" rx="1.5" fill="#fff" />
            </svg>
          </span>
          Ступень
        </Link>

        <h2>От первой курсовой до первого оффера — на одной платформе</h2>
        <p>
          Здесь работодатели публикуют реальные задачи, а студенты выполняют их с наставником
          и получают вознаграждение.
        </p>

        <ul className="auth__promo-list">
          {PROMO.map((p) => (
            <li key={p}>
              <CheckCircle2 /> {p}
            </li>
          ))}
        </ul>

        <div
          className="row mt-48"
          style={{ gap: 10, color: 'rgba(255,255,255,.5)', fontSize: '.8rem' }}
        >
          <BadgeCheck size={15} /> Демо-версия: данные хранятся в вашем браузере
        </div>
      </div>

      <div className="auth__panel">
        <div className="auth__form">
          <span className="eyebrow">{mode === 'login' ? 'Вход' : 'Регистрация'}</span>
          <h1 className="auth__title" style={{ marginTop: 12 }}>
            {mode === 'login' ? 'С возвращением' : 'Создайте аккаунт'}
          </h1>
          <p className="muted small" style={{ marginTop: 8, marginBottom: 26 }}>
            {mode === 'login'
              ? 'Войдите, чтобы откликаться на кейсы и следить за статусами.'
              : 'Выберите, кем вы будете на платформе: это определяет доступные функции.'}
          </p>

          {mode === 'register' && (
            <div className="role-picker" style={{ marginBottom: 20 }}>
              <button
                type="button"
                className={`role-option${role === 'student' ? ' active' : ''}`}
                onClick={() => setRole('student')}
              >
                <span className="role-option__title">
                  <GraduationCap size={16} /> Студент
                </span>
                <span className="role-option__desc">Ищу кейс, практику или тему для ВКР</span>
              </button>
              <button
                type="button"
                className={`role-option${role === 'employer' ? ' active' : ''}`}
                onClick={() => setRole('employer')}
              >
                <span className="role-option__title">
                  <Briefcase size={16} /> Работодатель
                </span>
                <span className="role-option__desc">Хочу размещать задачи и находить людей</span>
              </button>
            </div>
          )}

          <form onSubmit={submit} className="stack" style={{ gap: 16 }}>
            {mode === 'register' && (
              <Field label={role === 'employer' ? 'Ваше имя' : 'Имя и фамилия'} required>
                <div style={{ position: 'relative' }}>
                  <UserRound
                    size={16}
                    style={{ position: 'absolute', left: 13, top: 13, color: 'var(--muted)' }}
                  />
                  <input
                    className="input"
                    style={{ paddingLeft: 38 }}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={role === 'employer' ? 'Ирина Волкова' : 'Анна Ковалёва'}
                    autoComplete="name"
                  />
                </div>
              </Field>
            )}

            {mode === 'register' && role === 'employer' && (
              <Field label="Название компании" required>
                <input
                  className="input"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="ООО «ДатаКрафт»"
                  autoComplete="organization"
                />
              </Field>
            )}

            {mode === 'register' && role === 'student' && (
              <Field label="Вуз" hint="Можно указать позже в профиле">
                <input
                  className="input"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  placeholder="НИУ ВШЭ"
                />
              </Field>
            )}

            <Field label="E-mail" required>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 13, top: 13, color: 'var(--muted)' }} />
                <input
                  className="input"
                  style={{ paddingLeft: 38 }}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>
            </Field>

            <Field
              label="Пароль"
              required
              hint={mode === 'register' ? 'Минимум 6 символов' : undefined}
            >
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 13, top: 13, color: 'var(--muted)' }} />
                <input
                  className="input"
                  style={{ paddingLeft: 38 }}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
              </div>
            </Field>

            {error && (
              <div className="alert alert--error">
                <Info size={16} />
                <span>{error}</span>
              </div>
            )}

            <button className="btn btn--primary btn--lg btn--block" type="submit" disabled={busy}>
              {mode === 'login' ? 'Войти' : 'Создать аккаунт'}
              <ArrowRight size={17} />
            </button>
          </form>

          {mode === 'login' && (
            <>
              <div className="row mt-24" style={{ gap: 12 }}>
                <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
                <span className="tiny muted">или войдите в демо</span>
                <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
              </div>

              <div className="demo-box mt-16">
                <div className="tiny strong" style={{ marginBottom: 10 }}>
                  Демо-доступы (пароль demo1234)
                </div>
                <div className="stack" style={{ gap: 8 }}>
                  <button type="button" className="btn btn--outline btn--sm btn--block" onClick={() => quickLogin('student')}>
                    <GraduationCap size={15} /> Войти как студент — Анна Ковалёва
                  </button>
                  <button type="button" className="btn btn--outline btn--sm btn--block" onClick={() => quickLogin('employer')}>
                    <Briefcase size={15} /> Войти как работодатель — ДатаКрафт
                  </button>
                </div>
                <div className="tiny muted mt-8">
                  student@stupen.ru · hr@datacraft.ru
                </div>
              </div>
            </>
          )}

          <p className="small muted center mt-24">
            {mode === 'login' ? (
              <>
                Нет аккаунта?{' '}
                <Link to="/register" style={{ color: 'var(--brand-strong)', fontWeight: 600 }}>
                  Зарегистрироваться
                </Link>
              </>
            ) : (
              <>
                Уже есть аккаунт?{' '}
                <Link to="/login" style={{ color: 'var(--brand-strong)', fontWeight: 600 }}>
                  Войти
                </Link>
              </>
            )}
          </p>

          <div className="row mt-16" style={{ justifyContent: 'center', color: 'var(--muted)', fontSize: '.76rem', gap: 8 }}>
            <Sparkles size={13} /> Демо: регистрация создаёт локальный аккаунт в браузере
          </div>
        </div>
      </div>
    </div>
  )
}
