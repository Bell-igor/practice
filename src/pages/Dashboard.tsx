import { useMemo, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  ExternalLink,
  Eye,
  Heart,
  Inbox,
  LayoutDashboard,
  MessageSquare,
  Pencil,
  Plus,
  RotateCcw,
  Send,
  Settings2,
  Sparkles,
  Trash2,
  UserRound,
  Users,
  X,
} from 'lucide-react'
import { useApp } from '../store/AppStore'
import {
  APPLICATION_LABELS,
  APPLICATION_TONE,
  COMPANY_SIZES,
  DIRECTIONS,
  STUDY_YEARS,
  TYPE_LABELS,
  formatDate,
  formatShortDate,
  plural,
} from '../data/dictionaries'
import { Avatar, CompanyAvatar, EmptyState, Field, Modal, Stat, TypeBadge } from '../components/ui'
import { rewardText } from '../lib/helpers'
import type { Application, User } from '../types'

/* =============================== общий каркас =============================== */

export default function Dashboard() {
  const { currentUser } = useApp()
  if (!currentUser) return <Navigate to="/login?next=/dashboard" replace />
  return currentUser.role === 'student' ? <StudentDashboard /> : <EmployerDashboard />
}

/* =============================== студент =============================== */

function StudentDashboard() {
  const {
    state,
    currentUser,
    getCase,
    getUser,
    toggleFavorite,
    addPortfolioItem,
    removePortfolioItem,
    updateProfile,
    notify,
    resetDemo,
    logout,
  } = useApp()
  const [tab, setTab] = useState<'apps' | 'favorites' | 'portfolio' | 'profile'>('apps')
  const [portfolioOpen, setPortfolioOpen] = useState(false)
  const navigate = useNavigate()

  const user = currentUser as User
  const myApps = useMemo(
    () =>
      state.applications
        .filter((a) => a.studentId === user.id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [state.applications, user.id],
  )
  const favorites = useMemo(
    () => state.favorites.filter((f) => f.userId === user.id),
    [state.favorites, user.id],
  )
  const accepted = myApps.filter((a) => a.status === 'accepted').length
  const portfolio = user.portfolio ?? []

  return (
    <div className="page">
      <div className="container">
        <div className="dash-head">
          <Avatar name={user.name} color={user.avatarColor} size="lg" />
          <div style={{ flex: 1, minWidth: 220 }}>
            <h1>{user.name}</h1>
            <div className="small muted">
              {[user.university, user.specialty, user.studyYear].filter(Boolean).join(' · ') ||
                'Добавьте вуз и специальность в профиле'}
            </div>
          </div>
          <div className="row" style={{ gap: 8 }}>
            <button className="btn btn--outline btn--sm" onClick={() => setTab('profile')}>
              <Settings2 size={14} /> Профиль
            </button>
            <Link to="/cases" className="btn btn--primary btn--sm">
              <Sparkles size={14} /> Найти кейс
            </Link>
          </div>
        </div>

        <div className="stats">
          <Stat value={myApps.length} label={plural(myApps.length, 'отклик', 'отклика', 'откликов')} />
          <Stat value={accepted} label={plural(accepted, 'принят', 'принято', 'принято')} />
          <Stat value={favorites.length} label="в избранном" />
          <Stat
            value={portfolio.length}
            label={plural(portfolio.length, 'работа в портфолио', 'работы в портфолио', 'работ в портфолио')}
          />
        </div>

        <div className="tabs">
          <button className={`tab${tab === 'apps' ? ' active' : ''}`} onClick={() => setTab('apps')}>
            <Send size={15} /> Мои отклики <span className="tab__count">{myApps.length}</span>
          </button>
          <button
            className={`tab${tab === 'favorites' ? ' active' : ''}`}
            onClick={() => setTab('favorites')}
          >
            <Heart size={15} /> Избранное <span className="tab__count">{favorites.length}</span>
          </button>
          <button
            className={`tab${tab === 'portfolio' ? ' active' : ''}`}
            onClick={() => setTab('portfolio')}
          >
            <LayoutDashboard size={15} /> Портфолио <span className="tab__count">{portfolio.length}</span>
          </button>
          <button
            className={`tab${tab === 'profile' ? ' active' : ''}`}
            onClick={() => setTab('profile')}
          >
            <UserRound size={15} /> Профиль
          </button>
        </div>

        {tab === 'apps' && (
          <>
            {myApps.length === 0 ? (
              <EmptyState
                icon={<Inbox size={22} />}
                title="Пока ни одного отклика"
                description="Выберите кейс в каталоге и отправьте первый отклик — работодатель ответит в течение нескольких дней."
                action={
                  <Link to="/cases" className="btn btn--primary">
                    Перейти в каталог
                  </Link>
                }
              />
            ) : (
              <div className="list">
                {myApps.map((a) => {
                  const c = getCase(a.caseId)
                  if (!c) return null
                  const employer = getUser(c.employerId)
                  return (
                    <div className="list-row" key={a.id}>
                      <Avatar name={employer?.company ?? ''} color={employer?.avatarColor} />
                      <div className="list-row__body">
                        <Link to={`/cases/${c.id}`} className="list-row__title">
                          {c.title}
                        </Link>
                        <div className="list-row__meta">
                          <span>{employer?.company}</span>
                          <span>{TYPE_LABELS[c.type]}</span>
                          <span>отклик от {formatShortDate(a.createdAt)}</span>
                        </div>
                      </div>
                      <span className={`badge badge--${APPLICATION_TONE[a.status]}`}>
                        {APPLICATION_LABELS[a.status]}
                      </span>
                      <div className="list-row__actions">
                        <Link to={`/cases/${c.id}`} className="btn btn--outline btn--sm">
                          Открыть
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {tab === 'favorites' && (
          <>
            {favorites.length === 0 ? (
              <EmptyState
                icon={<Heart size={22} />}
                title="Избранное пусто"
                description="Сохраняйте интересные кейсы, чтобы вернуться к ним позже — например, когда освободится время."
                action={
                  <Link to="/cases" className="btn btn--primary">
                    Смотреть кейсы
                  </Link>
                }
              />
            ) : (
              <div className="grid grid--2">
                {favorites.map((f) => {
                  const c = getCase(f.caseId)
                  if (!c) return null
                  return (
                    <div className="card card--pad-sm" key={f.caseId}>
                      <div className="row row--between" style={{ alignItems: 'flex-start' }}>
                        <div className="chips">
                          <TypeBadge type={c.type} />
                        </div>
                        <button
                          className="btn btn--ghost btn--sm"
                          onClick={() => {
                            toggleFavorite(c.id)
                            notify('Убрано из избранного', 'info')
                          }}
                          aria-label="Убрать из избранного"
                        >
                          <X size={14} />
                        </button>
                      </div>
                      <Link to={`/cases/${c.id}`} className="strong" style={{ display: 'block', margin: '10px 0 6px' }}>
                        {c.title}
                      </Link>
                      <div className="tiny muted">
                        {getUser(c.employerId)?.company} · {c.city} · {rewardText(c.reward)}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {tab === 'portfolio' && (
          <>
            <div className="row row--between row--wrap" style={{ marginBottom: 16 }}>
              <p className="small muted" style={{ maxWidth: 560 }}>
                Портфолио видят работодатели, когда вы откликаетесь. Добавляйте проекты, кейсы и
                ссылки — это ваша витрина.
              </p>
              <button className="btn btn--primary btn--sm" onClick={() => setPortfolioOpen(true)}>
                <Plus size={15} /> Добавить работу
              </button>
            </div>

            {portfolio.length === 0 ? (
              <EmptyState
                icon={<LayoutDashboard size={22} />}
                title="Портфолио пока пустое"
                description="Добавьте учебный проект, кейс с платформы или пет-проект — везде, где видно результат."
                action={
                  <button className="btn btn--primary" onClick={() => setPortfolioOpen(true)}>
                    Добавить первую работу
                  </button>
                }
              />
            ) : (
              <div className="grid grid--2">
                {portfolio.map((p) => (
                  <div className="portfolio-item" key={p.id}>
                    <div className="row row--between" style={{ alignItems: 'flex-start' }}>
                      <div className="strong">{p.title}</div>
                      <button
                        className="btn btn--ghost btn--sm"
                        onClick={() => {
                          removePortfolioItem(p.id)
                          notify('Работа удалена', 'info')
                        }}
                        aria-label="Удалить работу"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <p className="small muted" style={{ lineHeight: 1.6 }}>
                      {p.description}
                    </p>
                    <div className="row row--between">
                      <span className="tiny muted">{p.year}</span>
                      {p.link && (
                        <a href={p.link} target="_blank" rel="noreferrer" className="btn btn--ghost btn--sm">
                          Смотреть <ExternalLink size={13} />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {tab === 'profile' && (
          <StudentProfileForm
            user={user}
            onSave={(patch) => {
              updateProfile(patch)
              notify('Профиль обновлён')
            }}
          />
        )}

        <div className="card mt-32" style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
          <span className="feature__icon" style={{ width: 36, height: 36 }}>
            <RotateCcw size={16} />
          </span>
          <div style={{ flex: 1, minWidth: 240 }}>
            <div className="small strong">Демо-данные</div>
            <div className="tiny muted">Вернуть исходные кейсы, отклики и аккаунты.</div>
          </div>
          <button
            className="btn btn--outline btn--sm"
            onClick={() => {
              resetDemo()
              logout()
              navigate('/')
              notify('Демо-данные восстановлены', 'info')
            }}
          >
            Сбросить
          </button>
        </div>
      </div>

      <PortfolioModal open={portfolioOpen} onClose={() => setPortfolioOpen(false)} onAdd={addPortfolioItem} notify={notify} />
    </div>
  )
}

function PortfolioModal({
  open,
  onClose,
  onAdd,
  notify,
}: {
  open: boolean
  onClose: () => void
  onAdd: (item: { title: string; description: string; link?: string; year: number }) => void
  notify: (m: string, t?: 'success' | 'error' | 'info') => void
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [link, setLink] = useState('')
  const [year, setYear] = useState(String(new Date().getFullYear()))
  const [error, setError] = useState('')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (title.trim().length < 3) return setError('Укажите название работы')
    if (description.trim().length < 10) return setError('Опишите результат — минимум 10 символов')
    onAdd({ title: title.trim(), description: description.trim(), link: link.trim() || undefined, year: Number(year) })
    setTitle('')
    setDescription('')
    setLink('')
    setError('')
    onClose()
    notify('Работа добавлена в портфолио')
  }

  return (
    <Modal open={open} title="Новая работа в портфолио" onClose={onClose}>
      <form className="stack" style={{ gap: 16 }} onSubmit={submit}>
        <Field label="Название" required>
          <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Дашборд продаж для интернет-магазина" />
        </Field>
        <Field label="Что сделано и какой результат" required>
          <textarea className="textarea" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="Собрал дашборд в Power BI, сократил подготовку отчёта с 3 часов до 5 минут…" />
        </Field>
        <div className="form-grid">
          <Field label="Ссылка" hint="GitHub, Behance, Google Drive">
            <input className="input" value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://" />
          </Field>
          <Field label="Год">
            <input className="input" value={year} onChange={(e) => setYear(e.target.value)} inputMode="numeric" />
          </Field>
        </div>
        {error && <div className="alert alert--error"><X size={15} /> {error}</div>}
        <div className="row" style={{ justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Отмена
          </button>
          <button type="submit" className="btn btn--primary">
            Добавить
          </button>
        </div>
      </form>
    </Modal>
  )
}

function StudentProfileForm({ user, onSave }: { user: User; onSave: (patch: Partial<User>) => void }) {
  const [form, setForm] = useState({
    name: user.name,
    university: user.university ?? '',
    specialty: user.specialty ?? '',
    studyYear: user.studyYear ?? '3 курс',
    city: user.city ?? '',
    about: user.about ?? '',
    skills: (user.skills ?? []).join(', '),
    telegram: user.telegram ?? '',
    resumeUrl: user.resumeUrl ?? '',
  })
  const [saved, setSaved] = useState(false)

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((f) => ({ ...f, [key]: e.target.value }))
    setSaved(false)
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      name: form.name.trim() || user.name,
      university: form.university,
      specialty: form.specialty,
      studyYear: form.studyYear,
      city: form.city,
      about: form.about,
      skills: form.skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      telegram: form.telegram,
      resumeUrl: form.resumeUrl,
    })
    setSaved(true)
  }

  return (
    <form className="card" onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div className="form-grid">
        <Field label="Имя и фамилия" required>
          <input className="input" value={form.name} onChange={set('name')} />
        </Field>
        <Field label="Город">
          <input className="input" value={form.city} onChange={set('city')} placeholder="Москва" />
        </Field>
        <Field label="Вуз">
          <input className="input" value={form.university} onChange={set('university')} placeholder="НИУ ВШЭ" />
        </Field>
        <Field label="Специальность">
          <input className="input" value={form.specialty} onChange={set('specialty')} placeholder="Прикладная математика" />
        </Field>
        <Field label="Курс">
          <select className="input" value={form.studyYear} onChange={set('studyYear')}>
            {STUDY_YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Telegram">
          <input className="input" value={form.telegram} onChange={set('telegram')} placeholder="@username" />
        </Field>
        <Field label="Ссылка на резюме" className="span-2" hint="PDF или hh.ru">
          <input className="input" value={form.resumeUrl} onChange={set('resumeUrl')} placeholder="https://" />
        </Field>
        <Field label="Навыки" className="span-2" hint="Через запятую — они показываются работодателю">
          <input className="input" value={form.skills} onChange={set('skills')} placeholder="Python, SQL, Figma" />
        </Field>
        <Field label="О себе" className="span-2">
          <textarea className="textarea" value={form.about} onChange={set('about')} rows={4} />
        </Field>
      </div>

      <div className="row" style={{ justifyContent: 'space-between' }}>
        <span className="tiny muted">
          {user.email} · аккаунт студента
        </span>
        <div className="row">
          {saved && (
            <span className="badge badge--success">
              <CheckCircle2 size={13} /> Сохранено
            </span>
          )}
          <button className="btn btn--primary" type="submit">
            Сохранить профиль
          </button>
        </div>
      </div>
    </form>
  )
}

/* =============================== работодатель =============================== */

function EmployerDashboard() {
  const {
    state,
    currentUser,
    getUser,
    getCase,
    deleteCase,
    setApplicationStatus,
    updateProfile,
    notify,
    getApplicationsForCase,
  } = useApp()
  const [tab, setTab] = useState<'cases' | 'apps' | 'company'>('cases')
  const [caseFilter, setCaseFilter] = useState<string>('all')
  const navigate = useNavigate()

  const user = currentUser as User
  const myCases = useMemo(
    () =>
      state.cases
        .filter((c) => c.employerId === user.id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [state.cases, user.id],
  )
  const caseIds = useMemo(() => new Set(myCases.map((c) => c.id)), [myCases])
  const myApps = useMemo(
    () =>
      state.applications
        .filter((a) => caseIds.has(a.caseId))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [state.applications, caseIds],
  )
  const accepted = myApps.filter((a) => a.status === 'accepted').length
  const views = myCases.reduce((s, c) => s + c.views, 0)
  const filteredApps = caseFilter === 'all' ? myApps : myApps.filter((a) => a.caseId === caseFilter)

  const removeCase = (id: string, title: string) => {
    if (!window.confirm(`Удалить кейс «${title}»? Отклики по нему тоже исчезнут.`)) return
    deleteCase(id)
    notify('Кейс удалён', 'info')
  }

  return (
    <div className="page">
      <div className="container">
        <div className="dash-head">
          <CompanyAvatar user={user} size="lg" />
          <div style={{ flex: 1, minWidth: 220 }}>
            <h1>{user.company ?? user.name}</h1>
            <div className="small muted">
              {[user.industry, user.city, user.companySize].filter(Boolean).join(' · ') || 'Заполните профиль компании'}
            </div>
          </div>
          <div className="row" style={{ gap: 8 }}>
            <button className="btn btn--outline btn--sm" onClick={() => setTab('company')}>
              <Settings2 size={14} /> Компания
            </button>
            <Link to="/case/new" className="btn btn--primary btn--sm">
              <Plus size={14} /> Новый кейс
            </Link>
          </div>
        </div>

        <div className="stats">
          <Stat
            value={myCases.length}
            label={plural(myCases.length, 'кейс размещён', 'кейса размещено', 'кейсов размещено')}
          />
          <Stat
            value={myApps.length}
            label={plural(myApps.length, 'отклик получен', 'отклика получено', 'откликов получено')}
          />
          <Stat value={accepted} label="принято исполнителей" />
          <Stat value={views} label="просмотров кейсов" />
        </div>

        <div className="tabs">
          <button className={`tab${tab === 'cases' ? ' active' : ''}`} onClick={() => setTab('cases')}>
            <Briefcase size={15} /> Мои кейсы <span className="tab__count">{myCases.length}</span>
          </button>
          <button className={`tab${tab === 'apps' ? ' active' : ''}`} onClick={() => setTab('apps')}>
            <Users size={15} /> Отклики <span className="tab__count">{myApps.length}</span>
          </button>
          <button className={`tab${tab === 'company' ? ' active' : ''}`} onClick={() => setTab('company')}>
            <Settings2 size={15} /> Компания
          </button>
        </div>

        {tab === 'cases' && (
          <>
            {myCases.length === 0 ? (
              <EmptyState
                icon={<Briefcase size={22} />}
                title="Вы ещё не размещали кейсы"
                description="Опишите задачу — от темы курсовой до стажировки. Это займёт около пяти минут."
                action={
                  <Link to="/case/new" className="btn btn--primary">
                    <Plus size={16} /> Разместить первый кейс
                  </Link>
                }
              />
            ) : (
              <div className="list">
                {myCases.map((c) => {
                  const apps = getApplicationsForCase(c.id)
                  const newApps = apps.filter((a) => a.status === 'pending').length
                  return (
                    <div className="list-row" key={c.id}>
                      <div className="list-row__body">
                        <Link to={`/cases/${c.id}`} className="list-row__title">
                          {c.title}
                        </Link>
                        <div className="list-row__meta">
                          <span>{TYPE_LABELS[c.type]}</span>
                          <span>{c.direction}</span>
                          <span>
                            <Eye size={12} /> {c.views}
                          </span>
                          <span>
                            <Users size={12} /> {apps.length}
                          </span>
                          <span>
                            <CalendarDays size={12} /> до {formatShortDate(c.deadline)}
                          </span>
                        </div>
                      </div>
                      {newApps > 0 && <span className="badge badge--info">+{newApps} новых</span>}
                      <span className={`badge badge--${c.status === 'published' ? 'success' : 'neutral'}`}>
                        {c.status === 'published' ? 'Опубликован' : c.status === 'draft' ? 'Черновик' : 'Закрыт'}
                      </span>
                      <div className="list-row__actions">
                        <Link to={`/case/${c.id}/edit`} className="btn btn--outline btn--sm">
                          <Pencil size={13} /> Изменить
                        </Link>
                        <button
                          className="btn btn--ghost btn--sm"
                          style={{ color: 'var(--danger)' }}
                          onClick={() => removeCase(c.id, c.title)}
                          aria-label="Удалить кейс"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {tab === 'apps' && (
          <>
            {myCases.length > 0 && (
              <div className="row row--between row--wrap" style={{ marginBottom: 16 }}>
                <p className="small muted">Выберите кейс, чтобы увидеть отклики только по нему.</p>
                <select className="select" value={caseFilter} onChange={(e) => setCaseFilter(e.target.value)}>
                  <option value="all">Все кейсы ({myApps.length})</option>
                  {myCases.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title.slice(0, 48)} ({getApplicationsForCase(c.id).length})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {filteredApps.length === 0 ? (
              <EmptyState
                icon={<Inbox size={22} />}
                title="Откликов пока нет"
                description="Кейсы видны в каталоге — студенты найдут их через поиск и фильтры. Проверьте, что указаны понятные требования и вознаграждение."
                action={
                  <Link to="/cases" className="btn btn--outline">
                    Посмотреть, как выглядят кейсы
                  </Link>
                }
              />
            ) : (
              <div className="list">
                {filteredApps.map((a) => {
                  const c = getCase(a.caseId)
                  const student = getUser(a.studentId)
                  if (!c || !student) return null
                  return (
                    <ApplicationRow
                      key={a.id}
                      application={a}
                      caseTitle={c.title}
                      caseId={c.id}
                      student={student}
                      onStatus={(status) => {
                        setApplicationStatus(a.id, status)
                        notify(
                          status === 'accepted'
                            ? `Отклик ${student.name} принят`
                            : status === 'rejected'
                              ? 'Отклик отклонён'
                              : 'Статус обновлён',
                          status === 'rejected' ? 'info' : 'success',
                        )
                      }}
                      onOpenProfile={() => navigate(`/students/${student.id}`)}
                    />
                  )
                })}
              </div>
            )}
          </>
        )}

        {tab === 'company' && (
          <EmployerProfileForm
            user={user}
            onSave={(patch) => {
              updateProfile(patch)
              notify('Профиль компании обновлён')
            }}
          />
        )}
      </div>
    </div>
  )
}

function ApplicationRow({
  application,
  caseTitle,
  caseId,
  student,
  onStatus,
  onOpenProfile,
}: {
  application: Application
  caseTitle: string
  caseId: string
  student: User
  onStatus: (s: Application['status']) => void
  onOpenProfile: () => void
}) {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div className="row row--wrap" style={{ alignItems: 'flex-start', gap: 14 }}>
        <Avatar name={student.name} color={student.avatarColor} />
        <div style={{ flex: 1, minWidth: 200 }}>
          <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
            <span className="strong">{student.name}</span>
            <span className={`badge badge--${APPLICATION_TONE[application.status]}`}>
              {APPLICATION_LABELS[application.status]}
            </span>
          </div>
          <div className="tiny muted">
            {[student.university, student.specialty, student.studyYear].filter(Boolean).join(' · ') || 'Профиль не заполнен'}
          </div>
        </div>
        <div className="tiny muted" style={{ textAlign: 'right' }}>
          <div>отклик от {formatDate(application.createdAt)}</div>
          <Link to={`/cases/${caseId}`} className="row" style={{ gap: 4, justifyContent: 'flex-end', marginTop: 4 }}>
            {caseTitle.length > 38 ? `${caseTitle.slice(0, 38)}…` : caseTitle} <ArrowRight size={12} />
          </Link>
        </div>
      </div>

      <p className="small application-message" style={{ color: 'var(--ink-2)', lineHeight: 1.6, background: 'var(--surface-2)', padding: 14, borderRadius: 12 }}>
        {application.message}
      </p>

      {student.skills && student.skills.length > 0 && (
        <div className="chips">
          {student.skills.slice(0, 6).map((s) => (
            <span key={s} className="chip" style={{ fontSize: '.74rem', padding: '3px 9px' }}>
              {s}
            </span>
          ))}
        </div>
      )}

      <div className="row row--wrap" style={{ gap: 8, justifyContent: 'flex-end' }}>
        <button className="btn btn--ghost btn--sm" onClick={onOpenProfile}>
          <UserRound size={13} /> Профиль
        </button>
        {application.status !== 'accepted' && (
          <button className="btn btn--success btn--sm" onClick={() => onStatus('accepted')}>
            <CheckCircle2 size={14} /> Принять
          </button>
        )}
        {application.status === 'pending' && (
          <button className="btn btn--outline btn--sm" onClick={() => onStatus('review')}>
            <MessageSquare size={14} /> На рассмотрение
          </button>
        )}
        {application.status !== 'rejected' && (
          <button className="btn btn--danger btn--sm" onClick={() => onStatus('rejected')}>
            <X size={14} /> Отклонить
          </button>
        )}
      </div>
    </div>
  )
}

function EmployerProfileForm({ user, onSave }: { user: User; onSave: (patch: Partial<User>) => void }) {
  const [form, setForm] = useState({
    name: user.name,
    company: user.company ?? '',
    position: user.position ?? '',
    industry: user.industry ?? DIRECTIONS[0],
    city: user.city ?? '',
    website: user.website ?? '',
    companySize: user.companySize ?? COMPANY_SIZES[1],
    companyAbout: user.companyAbout ?? '',
  })
  const [saved, setSaved] = useState(false)

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((f) => ({ ...f, [key]: e.target.value }))
    setSaved(false)
  }

  return (
    <form
      className="card"
      onSubmit={(e) => {
        e.preventDefault()
        onSave(form)
        setSaved(true)
      }}
      style={{ display: 'flex', flexDirection: 'column', gap: 18 }}
    >
      <div className="form-grid">
        <Field label="Компания" required>
          <input className="input" value={form.company} onChange={set('company')} />
        </Field>
        <Field label="Отрасль">
          <select className="input" value={form.industry} onChange={set('industry')}>
            {DIRECTIONS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Контактное лицо" required>
          <input className="input" value={form.name} onChange={set('name')} />
        </Field>
        <Field label="Должность">
          <input className="input" value={form.position} onChange={set('position')} />
        </Field>
        <Field label="Город">
          <input className="input" value={form.city} onChange={set('city')} />
        </Field>
        <Field label="Размер компании">
          <select className="input" value={form.companySize} onChange={set('companySize')}>
            {COMPANY_SIZES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Сайт" className="span-2">
          <input className="input" value={form.website} onChange={set('website')} placeholder="company.ru" />
        </Field>
        <Field label="О компании" className="span-2" hint="Видят студенты на странице компании и в кейсах">
          <textarea className="textarea" value={form.companyAbout} onChange={set('companyAbout')} rows={4} />
        </Field>
      </div>

      <div className="row" style={{ justifyContent: 'space-between' }}>
        <span className="tiny muted">{user.email} · аккаунт работодателя</span>
        <div className="row">
          {saved && (
            <span className="badge badge--success">
              <CheckCircle2 size={13} /> Сохранено
            </span>
          )}
          <button className="btn btn--primary" type="submit">
            Сохранить
          </button>
        </div>
      </div>
    </form>
  )
}
