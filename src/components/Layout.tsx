import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import {
  ArrowRight,
  Briefcase,
  Building2,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Plus,
  Sun,
  X,
} from 'lucide-react'
import { useApp } from '../store/AppStore'
import { Avatar, Toaster } from './ui'

function Logo() {
  return (
    <Link to="/" className="logo" aria-label="Ступень — на главную">
      <span className="logo__mark">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="3" y="14" width="5" height="7" rx="1.5" fill="#fff" opacity=".55" />
          <rect x="9.5" y="9" width="5" height="12" rx="1.5" fill="#fff" opacity=".8" />
          <rect x="16" y="3" width="5" height="18" rx="1.5" fill="#fff" />
        </svg>
      </span>
      Ступень
      <span className="logo__tag">beta</span>
    </Link>
  )
}

const NAV = [
  { to: '/cases', label: 'Кейсы и стажировки' },
  { to: '/companies', label: 'Компании' },
  { to: '/how', label: 'Как это работает' },
  { to: '/about', label: 'О проекте' },
]

export default function Layout() {
  const { currentUser, logout, theme, toggleTheme, notify } = useApp()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
    setMobileOpen(false)
    setMenuOpen(false)
  }, [location.pathname])

  const handleLogout = () => {
    logout()
    notify('Вы вышли из аккаунта', 'info')
    navigate('/')
  }

  return (
    <>
      <header className="header">
        <div className="container header__inner">
          <Logo />

          <nav className="nav" aria-label="Основная навигация">
            {NAV.map((item) => (
              <NavLink key={item.to} to={item.to} className={({ isActive }) => (isActive ? 'active' : '')}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="header__actions">
            <button
              className="icon-btn"
              onClick={toggleTheme}
              aria-label={theme === 'light' ? 'Включить тёмную тему' : 'Включить светлую тему'}
              title={theme === 'light' ? 'Тёмная тема' : 'Светлая тема'}
            >
              {theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
            </button>

            {currentUser ? (
              <div style={{ position: 'relative' }}>
                <button
                  className="row"
                  onClick={() => setMenuOpen((v) => !v)}
                  aria-expanded={menuOpen}
                  style={{
                    border: '1px solid var(--line)',
                    background: 'var(--surface)',
                    borderRadius: 12,
                    padding: '5px 10px 5px 5px',
                    cursor: 'pointer',
                  }}
                >
                  <Avatar
                    name={currentUser.role === 'employer' ? currentUser.company ?? currentUser.name : currentUser.name}
                    color={currentUser.avatarColor}
                    size="sm"
                  />
                  <span
                    className="small strong header__user-name"
                    style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                  >
                    {currentUser.role === 'employer' ? currentUser.company : currentUser.name.split(' ')[0]}
                  </span>
                </button>

                {menuOpen && (
                  <>
                    <div
                      style={{ position: 'fixed', inset: 0, zIndex: 40 }}
                      onClick={() => setMenuOpen(false)}
                      aria-hidden="true"
                    />
                    <div
                      className="card"
                      style={{
                        position: 'absolute',
                        right: 0,
                        top: 'calc(100% + 8px)',
                        width: 232,
                        padding: 8,
                        zIndex: 50,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                      }}
                    >
                      <Link
                        to="/dashboard"
                        className="btn btn--ghost"
                        style={{ justifyContent: 'flex-start' }}
                      >
                        <LayoutDashboard size={16} /> Личный кабинет
                      </Link>
                      {currentUser.role === 'employer' && (
                        <Link
                          to="/case/new"
                          className="btn btn--ghost"
                          style={{ justifyContent: 'flex-start' }}
                        >
                          <Plus size={16} /> Новый кейс
                        </Link>
                      )}
                      <button
                        className="btn btn--ghost"
                        style={{ justifyContent: 'flex-start', color: 'var(--danger)' }}
                        onClick={handleLogout}
                      >
                        <LogOut size={16} /> Выйти
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="btn btn--ghost btn--hide-sm">
                  Войти
                </Link>
                <Link to="/register?role=employer" className="btn btn--primary">
                  <Plus size={16} />
                  <span className="btn-label">Разместить кейс</span>
                </Link>
              </>
            )}

            <button
              className="icon-btn mobile-only"
              aria-label="Меню"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="container" style={{ paddingBottom: 16 }}>
            <div className="stack">
              {NAV.map((item) => (
                <Link key={item.to} to={item.to} className="btn btn--ghost" style={{ justifyContent: 'flex-start' }}>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="footer">
        <div className="container">
          <div className="footer__top">
            <div className="footer__col">
              <Logo />
              <p className="muted small" style={{ marginTop: 14, maxWidth: 300, lineHeight: 1.6 }}>
                Платформа, где компании публикуют реальные задачи, а студенты решают их,
                собирают портфолио и получают первый оффер.
              </p>
            </div>

            <div className="footer__col">
              <h4>Платформа</h4>
              <Link to="/cases">Каталог кейсов</Link>
              <Link to="/cases?type=internship">Стажировки</Link>
              <Link to="/cases?type=coursework">Темы курсовых</Link>
              <Link to="/cases?type=diploma">Темы дипломов</Link>
              <Link to="/companies">Компании</Link>
            </div>

            <div className="footer__col">
              <h4>Студентам</h4>
              <Link to="/how">Как это работает</Link>
              <Link to="/dashboard">Личный кабинет</Link>
              <Link to="/about">О проекте</Link>
              <Link to="/about#faq">Вопросы и ответы</Link>
            </div>

            <div className="footer__col">
              <h4>Работодателям</h4>
              <Link to="/case/new">Разместить кейс</Link>
              <Link to="/register?role=employer">Создать аккаунт</Link>
              <Link to="/how">Условия размещения</Link>
              <a href="mailto:hello@stupen.ru">hello@stupen.ru</a>
            </div>
          </div>

          <div className="footer__bottom">
            <span>© {new Date().getFullYear()} Ступень. Демо-версия платформы.</span>
            <span className="row" style={{ gap: 16 }}>
              <span className="row" style={{ gap: 6 }}>
                <Briefcase size={14} /> {new Date().getFullYear()} — пилот
              </span>
              <span className="row" style={{ gap: 6 }}>
                <Building2 size={14} /> Данные хранятся в вашем браузере
              </span>
              <Link to="/about" className="row" style={{ gap: 4 }}>
                Подробнее <ArrowRight size={13} />
              </Link>
            </span>
          </div>
        </div>
      </footer>

      <Toaster />
    </>
  )
}
