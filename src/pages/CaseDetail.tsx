import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock,
  Copy,
  Eye,
  Heart,
  MapPin,
  MessageSquare,
  Pencil,
  Send,
  ShieldCheck,
  Sparkles,
  Users,
  Wallet,
} from 'lucide-react'
import { useApp } from '../store/AppStore'
import {
  APPLICATION_LABELS,
  APPLICATION_TONE,
  FORMAT_LABELS,
  TYPE_LABELS,
  daysLeft,
  formatDate,
  formatMoney,
  plural,
} from '../data/dictionaries'
import { isPaid, rewardText } from '../lib/helpers'
import { Avatar, EmptyState, Modal, TypeBadge } from '../components/ui'
import CaseCard from '../components/CaseCard'

export default function CaseDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const {
    state,
    currentUser,
    getCase,
    getUser,
    viewCase,
    apply,
    isFavorite,
    toggleFavorite,
    notify,
    getApplicationsForCase,
  } = useApp()
  const [modalOpen, setModalOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)

  const item = id ? getCase(id) : undefined

  useEffect(() => {
    if (item) viewCase(item.id)
  }, [item, viewCase])

  const employer = item ? getUser(item.employerId) : undefined
  const myApplication = useMemo(
    () =>
      currentUser
        ? state.applications.find((a) => a.caseId === item?.id && a.studentId === currentUser.id)
        : undefined,
    [currentUser, state.applications, item?.id],
  )

  const similar = useMemo(() => {
    if (!item) return []
    return state.cases
      .filter(
        (c) =>
          c.id !== item.id &&
          c.status === 'published' &&
          (c.direction === item.direction || c.type === item.type),
      )
      .slice(0, 2)
  }, [item, state.cases])

  if (!item) {
    return (
      <div className="page">
        <div className="container container--narrow">
          <EmptyState
            icon={<Briefcase size={22} />}
            title="Кейс не найден"
            description="Возможно, он был закрыт или удалён. Посмотрите другие предложения в каталоге."
            action={
              <Link to="/cases" className="btn btn--primary">
                В каталог
              </Link>
            }
          />
        </div>
      </div>
    )
  }

  const left = daysLeft(item.deadline)
  const expired = left < 0
  const isOwner = currentUser?.id === item.employerId
  const fav = isFavorite(item.id)
  const applicationsCount = getApplicationsForCase(item.id).length

  const openApply = () => {
    if (!currentUser) {
      notify('Чтобы откликнуться, войдите в аккаунт студента', 'info')
      navigate(`/login?next=${encodeURIComponent(`/cases/${item.id}`)}`)
      return
    }
    setError('')
    setModalOpen(true)
  }

  const submitApply = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim().length < 20) {
      setError('Расскажите о себе чуть подробнее — минимум 20 символов')
      return
    }
    setSending(true)
    const res = apply(item.id, message)
    setSending(false)
    if (!res.ok) {
      setError(res.error ?? 'Не удалось отправить отклик')
      return
    }
    setModalOpen(false)
    setMessage('')
    notify('Отклик отправлен — работодатель увидит его в кабинете')
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      notify('Ссылка скопирована', 'info')
    } catch {
      notify('Не удалось скопировать ссылку', 'error')
    }
  }

  return (
    <div className="page">
      <div className="container">
        <nav className="breadcrumbs" aria-label="Хлебные крошки">
          <Link to="/">Главная</Link>
          <ChevronRight size={14} />
          <Link to="/cases">Кейсы</Link>
          <ChevronRight size={14} />
          <Link to={`/companies/${item.employerId}`}>{employer?.company}</Link>
          <ChevronRight size={14} />
          <span style={{ color: 'var(--ink-2)' }}>{TYPE_LABELS[item.type]}</span>
        </nav>

        <div className="detail mt-24">
          <div className="detail__main">
            <div>
              <div className="chips">
                <TypeBadge type={item.type} />
                <span className="badge badge--outline">{item.direction}</span>
                <span className="badge badge--outline">{FORMAT_LABELS[item.format]}</span>
                {item.featured && (
                  <span className="badge badge--accent">
                    <Sparkles size={12} /> Выбор редакции
                  </span>
                )}
                {expired && <span className="badge badge--danger">Приём закрыт</span>}
              </div>

              <h1>{item.title}</h1>
              <p className="detail__lead">{item.summary}</p>

              <div className="info-strip mt-16">
                <span>
                  <MapPin size={14} /> {item.city}
                </span>
                <span>
                  <Clock size={14} /> {item.duration}
                </span>
                <span>
                  <CalendarDays size={14} /> до {formatDate(item.deadline)}
                </span>
                <span>
                  <Eye size={14} /> {item.views} {plural(item.views, 'просмотр', 'просмотра', 'просмотров')}
                </span>
                <span>
                  <Users size={14} /> {applicationsCount}{' '}
                  {plural(applicationsCount, 'отклик', 'отклика', 'откликов')}
                </span>
              </div>
            </div>

            <div className="card">
              <h2 className="card-title">О задаче</h2>
              <div className="prose">
                {item.description.split('\n\n').map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </div>

            <div className="grid grid--2" style={{ gap: 22 }}>
              <div className="card">
                <h2 className="card-title">
                  <CheckCircle2 size={17} style={{ color: 'var(--success)' }} /> Что нужно сделать
                </h2>
                <ul className="checklist">
                  {item.tasks.map((t) => (
                    <li key={t}>
                      <CheckCircle2 /> <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="card">
                <h2 className="card-title">
                  <ShieldCheck size={17} style={{ color: 'var(--brand)' }} /> Что важно
                </h2>
                <ul className="checklist checklist--muted">
                  {item.requirements.map((r) => (
                    <li key={r}>
                      <CheckCircle2 /> <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="card">
              <h2 className="card-title">Что получит студент</h2>
              <div className="grid grid--3" style={{ gap: 16 }}>
                {item.outcomes.map((o) => (
                  <div key={o} className="feature" style={{ gap: 10 }}>
                    <span className="feature__icon feature__icon--success" style={{ width: 34, height: 34, borderRadius: 10 }}>
                      <Wallet size={16} />
                    </span>
                    <p style={{ fontSize: '0.88rem', color: 'var(--ink-2)' }}>{o}</p>
                  </div>
                ))}
              </div>

              <hr className="divider" />

              <div className="row row--between row--wrap">
                <div>
                  <div className="label">Навыки, которые пригодятся</div>
                  <div className="chips mt-8">
                    {item.skills.map((s) => (
                      <Link
                        key={s}
                        to={`/cases?q=${encodeURIComponent(s)}`}
                        className="chip chip--button"
                      >
                        {s}
                      </Link>
                    ))}
                  </div>
                </div>
                <div className="tiny muted">
                  Наставник: {item.mentor ?? employer?.name}
                </div>
              </div>
            </div>

            <div className="card" style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
              <Avatar name={employer?.company ?? 'Компания'} color={employer?.avatarColor} size="lg" />
              <div style={{ flex: 1, minWidth: 220 }}>
                <div className="strong">{employer?.company}</div>
                <div className="tiny muted">
                  {employer?.industry} · {employer?.city} · {employer?.companySize}
                </div>
              </div>
              <Link to={`/companies/${item.employerId}`} className="btn btn--outline">
                О компании <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          <aside className="sidebar-card">
            <div className="card">
              <div className="reward-box">
                <div className="tiny muted" style={{ textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 700 }}>
                  Вознаграждение
                </div>
                <div className="reward-box__value">
                  {item.reward.type === 'money'
                    ? formatMoney(item.reward.amount)
                    : rewardText(item.reward)}
                </div>
                <div className="reward-box__note">{item.reward.note}</div>
              </div>

              <div className="stack mt-16">
                {isOwner ? (
                  <Link to={`/case/${item.id}/edit`} className="btn btn--primary btn--block">
                    <Pencil size={16} /> Редактировать кейс
                  </Link>
                ) : myApplication ? (
                  <div className="stack" style={{ gap: 8 }}>
                    <span className={`badge badge--${APPLICATION_TONE[myApplication.status]}`} style={{ alignSelf: 'flex-start' }}>
                      Отклик: {APPLICATION_LABELS[myApplication.status]}
                    </span>
                    <Link to="/dashboard" className="btn btn--outline btn--block">
                      Смотреть в кабинете
                    </Link>
                  </div>
                ) : (
                  <button
                    className="btn btn--primary btn--block"
                    onClick={openApply}
                    disabled={expired || item.status !== 'published'}
                  >
                    <Send size={16} /> {expired ? 'Приём закрыт' : 'Откликнуться'}
                  </button>
                )}

                <div className="row" style={{ gap: 8 }}>
                  <button
                    className={`btn btn--outline${fav ? ' btn--soft' : ''}`}
                    style={{ flex: 1 }}
                    onClick={() => {
                      if (!currentUser) {
                        navigate('/login')
                        return
                      }
                      toggleFavorite(item.id)
                      notify(fav ? 'Убрано из избранного' : 'Добавлено в избранное', 'info')
                    }}
                  >
                    <Heart size={15} fill={fav ? 'currentColor' : 'none'} /> {fav ? 'В избранном' : 'Сохранить'}
                  </button>
                  <button className="btn btn--outline" onClick={copyLink} aria-label="Скопировать ссылку">
                    <Copy size={15} />
                  </button>
                </div>
              </div>

              <hr className="divider" />

              <div className="meta-list">
                <div className="meta-row">
                  <span className="meta-row__label">
                    <Clock size={14} /> Длительность
                  </span>
                  <span className="meta-row__value">{item.duration}</span>
                </div>
                <div className="meta-row">
                  <span className="meta-row__label">
                    <CalendarDays size={14} /> Дедлайн
                  </span>
                  <span className="meta-row__value" style={left <= 7 && left >= 0 ? { color: 'var(--accent)' } : undefined}>
                    {formatDate(item.deadline)}
                  </span>
                </div>
                <div className="meta-row">
                  <span className="meta-row__label">
                    <Users size={14} /> Мест
                  </span>
                  <span className="meta-row__value">{item.slots}</span>
                </div>
                <div className="meta-row">
                  <span className="meta-row__label">
                    <MapPin size={14} /> Формат
                  </span>
                  <span className="meta-row__value">{FORMAT_LABELS[item.format]}</span>
                </div>
                <div className="meta-row">
                  <span className="meta-row__label">
                    <Briefcase size={14} /> Тип
                  </span>
                  <span className="meta-row__value">{TYPE_LABELS[item.type]}</span>
                </div>
              </div>

              {item.reward.type === 'none' && (
                <p className="tiny muted mt-16" style={{ lineHeight: 1.5 }}>
                  Вознаграждение не предусмотрено, но кейс даёт опыт и рекомендацию.
                </p>
              )}
            </div>

            <div className="card card--pad-sm">
              <div className="row" style={{ gap: 10 }}>
                <span className="feature__icon" style={{ width: 34, height: 34, borderRadius: 10 }}>
                  <MessageSquare size={16} />
                </span>
                <div>
                  <div className="small strong">Есть вопросы?</div>
                  <div className="tiny muted">Напишите наставнику до отклика.</div>
                </div>
              </div>
              <a
                className="btn btn--outline btn--sm btn--block mt-16"
                href={`mailto:${employer?.email}?subject=${encodeURIComponent(item.title)}`}
              >
                Задать вопрос
              </a>
            </div>
          </aside>
        </div>

        {similar.length > 0 && (
          <section className="section" style={{ paddingBottom: 0 }}>
            <div className="section-head">
              <div>
                <span className="eyebrow">Похожие</span>
                <h2>Ещё по этой теме</h2>
              </div>
              <Link to={`/cases?direction=${encodeURIComponent(item.direction)}`} className="btn btn--ghost">
                Все в направлении <ArrowRight size={15} />
              </Link>
            </div>
            <div className="cases-grid">
              {similar.map((c) => (
                <CaseCard key={c.id} item={c} employer={getUser(c.employerId)} />
              ))}
            </div>
          </section>
        )}

        <div className="mt-32">
          <Link to="/cases" className="btn btn--ghost">
            <ArrowLeft size={16} /> Вернуться в каталог
          </Link>
        </div>
      </div>

      <Modal
        open={modalOpen}
        title={`Отклик на «${item.title}»`}
        onClose={() => setModalOpen(false)}
      >
        <form onSubmit={submitApply} className="stack" style={{ gap: 16 }}>
          <div className="alert alert--info">
            <ShieldCheck size={17} />
            <span>
              Работодатель увидит ваш профиль{isPaid(item.reward) ? ' и сумму вознаграждения' : ''}.
              Отклик ни к чему не обязывает до подтверждения условий.
            </span>
          </div>

          <label className="field">
            <span className="label">
              Сопроводительное сообщение <span>*</span>
            </span>
            <textarea
              className="textarea"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value)
                setError('')
              }}
              placeholder="Почему вам интересен кейс, что уже делали похожего, когда готовы начать…"
              rows={6}
            />
            <span className="field__hint">{message.trim().length}/20 символов минимум</span>
            {error && <span className="field__error">{error}</span>}
          </label>

          <div className="row" style={{ justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn--ghost" onClick={() => setModalOpen(false)}>
              Отмена
            </button>
            <button type="submit" className="btn btn--primary" disabled={sending}>
              <Send size={15} /> Отправить отклик
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
