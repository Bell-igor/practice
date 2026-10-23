import { Link, useParams } from 'react-router-dom'
import { useMemo } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Building2,
  Globe,
  MapPin,
  Users,
} from 'lucide-react'
import { useApp } from '../store/AppStore'
import { Avatar, EmptyState } from '../components/ui'
import CaseCard from '../components/CaseCard'
import { formatDate } from '../data/dictionaries'

export default function Company() {
  const { id } = useParams()
  const { state, getUser } = useApp()
  const company = id ? getUser(id) : undefined

  const cases = useMemo(
    () =>
      state.cases
        .filter((c) => c.employerId === id && c.status === 'published')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [state.cases, id],
  )

  if (!company || company.role !== 'employer') {
    return (
      <div className="page">
        <div className="container container--narrow">
          <EmptyState
            icon={<Building2 size={22} />}
            title="Компания не найдена"
            description="Возможно, страница больше не существует. Посмотрите другие компании-партнёры."
            action={
              <Link to="/companies" className="btn btn--primary">
                Все компании
              </Link>
            }
          />
        </div>
      </div>
    )
  }

  const totalApps = state.applications.filter((a) => cases.some((c) => c.id === a.caseId)).length

  return (
    <div className="page">
      <div className="container">
        <Link to="/companies" className="btn btn--ghost btn--sm" style={{ marginBottom: 16 }}>
          <ArrowLeft size={15} /> Все компании
        </Link>

        <div className="card" style={{ padding: 32 }}>
          <div className="row row--wrap" style={{ gap: 22, alignItems: 'flex-start' }}>
            <Avatar name={company.company ?? company.name} color={company.avatarColor} size="xl" />
            <div style={{ flex: 1, minWidth: 260 }}>
              <h1 style={{ fontSize: 'clamp(1.5rem,2.6vw,2rem)' }}>{company.company ?? company.name}</h1>
              <div className="info-strip mt-8">
                <span>
                  <Building2 size={14} /> {company.industry}
                </span>
                <span>
                  <MapPin size={14} /> {company.city}
                </span>
                <span>
                  <Users size={14} /> {company.companySize}
                </span>
                {company.website && (
                  <a href={`https://${company.website}`} target="_blank" rel="noreferrer" className="row" style={{ gap: 5 }}>
                    <Globe size={14} /> {company.website}
                  </a>
                )}
              </div>
            </div>
            <div className="row" style={{ gap: 10 }}>
              <div className="stat" style={{ border: 0, background: 'var(--surface-2)', minWidth: 110 }}>
                <div className="stat__value">{cases.length}</div>
                <div className="stat__label">кейсов</div>
              </div>
              <div className="stat" style={{ border: 0, background: 'var(--surface-2)', minWidth: 110 }}>
                <div className="stat__value">{totalApps}</div>
                <div className="stat__label">откликов</div>
              </div>
            </div>
          </div>

          {company.companyAbout && (
            <>
              <hr className="divider" />
              <div className="prose" style={{ maxWidth: 760 }}>
                <p>{company.companyAbout}</p>
              </div>
            </>
          )}

          <div className="info-strip mt-16">
            <span>
              <Briefcase size={14} /> Контакт: {company.name}
              {company.position ? `, ${company.position}` : ''}
            </span>
            <span>На платформе с {formatDate(company.createdAt)}</span>
          </div>
        </div>

        <div className="section-head mt-48">
          <div>
            <span className="eyebrow">Кейсы</span>
            <h2>Открытые предложения</h2>
          </div>
          <Link to="/cases" className="btn btn--ghost">
            Весь каталог <ArrowRight size={15} />
          </Link>
        </div>

        {cases.length === 0 ? (
          <EmptyState
            icon={<Briefcase size={22} />}
            title="Сейчас открытых кейсов нет"
            description="Компания готовит новые задачи. Посмотрите другие предложения в каталоге."
            action={
              <Link to="/cases" className="btn btn--primary">
                В каталог
              </Link>
            }
          />
        ) : (
          <div className="cases-grid">
            {cases.map((c) => (
              <CaseCard key={c.id} item={c} employer={company} />
            ))}
          </div>
        )}

        <div className="card mt-48" style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <span className="feature__icon">
            <Building2 size={18} />
          </span>
          <div style={{ flex: 1, minWidth: 240 }}>
            <div className="strong small">Хотите предложить задачу этой компании?</div>
            <div className="tiny muted">Напишите на {company.email} — контакт открыт для студентов.</div>
          </div>
          <a href={`mailto:${company.email}`} className="btn btn--outline btn--sm">
            Написать
          </a>
        </div>
      </div>
    </div>
  )
}
