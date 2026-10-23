import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ExternalLink, GraduationCap, Mail, MapPin, Send, UserRound } from 'lucide-react'
import { useApp } from '../store/AppStore'
import { Avatar, EmptyState } from '../components/ui'

export default function StudentProfile() {
  const { id } = useParams()
  const { state, getUser } = useApp()
  const student = id ? getUser(id) : undefined

  if (!student || student.role !== 'student') {
    return (
      <div className="page">
        <div className="container container--narrow">
          <EmptyState
            icon={<UserRound size={22} />}
            title="Студент не найден"
            description="Профиль мог быть удалён. Вернитесь в кабинет, чтобы посмотреть другие отклики."
            action={
              <Link to="/dashboard" className="btn btn--primary">
                В кабинет
              </Link>
            }
          />
        </div>
      </div>
    )
  }

  const portfolio = student.portfolio ?? []
  const applications = state.applications.filter((a) => a.studentId === student.id)

  return (
    <div className="page">
      <div className="container container--narrow">
        <Link to="/dashboard" className="btn btn--ghost btn--sm" style={{ marginBottom: 16 }}>
          <ArrowLeft size={15} /> Назад
        </Link>

        <div className="card" style={{ padding: 30 }}>
          <div className="row row--wrap" style={{ gap: 18, alignItems: 'flex-start' }}>
            <Avatar name={student.name} color={student.avatarColor} size="xl" />
            <div style={{ flex: 1, minWidth: 240 }}>
              <h1 style={{ fontSize: 'clamp(1.4rem,2.4vw,1.9rem)' }}>{student.name}</h1>
              <div className="info-strip mt-8">
                <span>
                  <GraduationCap size={14} /> {student.university || 'Вуз не указан'}
                </span>
                {student.specialty && <span>{student.specialty}</span>}
                {student.studyYear && <span>{student.studyYear}</span>}
                {student.city && (
                  <span>
                    <MapPin size={14} /> {student.city}
                  </span>
                )}
              </div>
            </div>
            <div className="row" style={{ gap: 8 }}>
              <a
                className="btn btn--outline btn--sm"
                href={`mailto:${student.email}`}
                title={student.email}
              >
                <Mail size={14} /> Почта
              </a>
              {student.telegram && (
                <a
                  className="btn btn--primary btn--sm"
                  href={`https://t.me/${student.telegram.replace('@', '')}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Send size={14} /> Telegram
                </a>
              )}
            </div>
          </div>

          {student.about && (
            <>
              <hr className="divider" />
              <p style={{ color: 'var(--ink-2)', lineHeight: 1.7 }}>{student.about}</p>
            </>
          )}

          {(student.skills ?? []).length > 0 && (
            <>
              <hr className="divider" />
              <div className="label">Навыки</div>
              <div className="chips mt-8">
                {(student.skills ?? []).map((s) => (
                  <span key={s} className="chip">
                    {s}
                  </span>
                ))}
              </div>
            </>
          )}

          <div className="info-strip mt-24">
            <span>Откликов на платформе: {applications.length}</span>
            {student.resumeUrl && (
              <a href={student.resumeUrl} target="_blank" rel="noreferrer" className="row" style={{ gap: 4 }}>
                Резюме <ExternalLink size={12} />
              </a>
            )}
          </div>
        </div>

        <div className="section-head mt-32">
          <div>
            <span className="eyebrow">Портфолио</span>
            <h2 style={{ fontSize: '1.35rem' }}>Проекты и работы</h2>
          </div>
        </div>

        {portfolio.length === 0 ? (
          <EmptyState
            icon={<UserRound size={22} />}
            title="Портфолио пока пустое"
            description="Студент ещё не добавил работы. Можно запросить примеры напрямую."
            action={
              <a className="btn btn--outline" href={`mailto:${student.email}`}>
                Запросить примеры работ
              </a>
            }
          />
        ) : (
          <div className="grid grid--2">
            {portfolio.map((p) => (
              <div className="portfolio-item" key={p.id}>
                <div className="row row--between">
                  <div className="strong">{p.title}</div>
                  <span className="tiny muted">{p.year}</span>
                </div>
                <p className="small muted" style={{ lineHeight: 1.6 }}>
                  {p.description}
                </p>
                {p.link && (
                  <a href={p.link} target="_blank" rel="noreferrer" className="btn btn--ghost btn--sm" style={{ alignSelf: 'flex-start' }}>
                    Открыть <ExternalLink size={13} />
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
