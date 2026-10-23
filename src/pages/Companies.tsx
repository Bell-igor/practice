import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Building2, MapPin, Search, Users } from 'lucide-react'
import { useApp } from '../store/AppStore'
import { plural } from '../data/dictionaries'
import { Avatar, EmptyState, SectionHead } from '../components/ui'

export default function Companies() {
  const { state } = useApp()
  const [query, setQuery] = useState('')

  const companies = useMemo(() => {
    const employers = state.users.filter((u) => u.role === 'employer')
    return employers
      .map((u) => {
        const cases = state.cases.filter((c) => c.employerId === u.id && c.status === 'published')
        return { user: u, casesCount: cases.length, directions: [...new Set(cases.map((c) => c.direction))] }
      })
      .filter((c) => c.casesCount > 0)
      .filter((c) => {
        const needle = query.trim().toLowerCase()
        if (!needle) return true
        return [c.user.company, c.user.industry, c.user.city, ...c.directions]
          .join(' ')
          .toLowerCase()
          .includes(needle)
      })
      .sort((a, b) => b.casesCount - a.casesCount)
  }, [state.users, state.cases, query])

  return (
    <div className="page">
      <div className="container">
        <SectionHead
          eyebrow="Компании"
          title="Кто размещает кейсы"
          subtitle="Небольшие продуктовые команды, агентства и промышленные компании. У каждой — живые задачи и наставник."
          action={
            <div className="searchbar" style={{ minWidth: 260 }}>
              <Search size={17} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Компания, отрасль, город"
                aria-label="Поиск компаний"
              />
            </div>
          }
        />

        {companies.length === 0 ? (
          <EmptyState
            icon={<Building2 size={22} />}
            title="Компании не найдены"
            description="Попробуйте другой запрос — или посмотрите каталог кейсов, там можно фильтровать по направлению."
            action={
              <Link to="/cases" className="btn btn--primary">
                В каталог кейсов
              </Link>
            }
          />
        ) : (
          <div className="grid grid--3">
            {companies.map(({ user, casesCount, directions }) => (
              <Link key={user.id} to={`/companies/${user.id}`} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="row" style={{ gap: 12 }}>
                  <Avatar name={user.company ?? user.name} color={user.avatarColor} size="lg" />
                  <div style={{ minWidth: 0 }}>
                    <div className="strong" style={{ fontSize: '1rem' }}>
                      {user.company ?? user.name}
                    </div>
                    <div className="tiny muted">{user.industry}</div>
                  </div>
                </div>

                <p
                  className="small muted"
                  style={{
                    lineHeight: 1.6,
                    minHeight: 46,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {user.companyAbout}
                </p>

                <div className="row tiny muted" style={{ gap: 14, flexWrap: 'wrap' }}>
                  <span className="row" style={{ gap: 5 }}>
                    <MapPin size={13} /> {user.city}
                  </span>
                  <span className="row" style={{ gap: 5 }}>
                    <Users size={13} /> {user.companySize}
                  </span>
                </div>

                <div className="row row--between" style={{ borderTop: '1px solid var(--line)', paddingTop: 12 }}>
                  <div className="chips">
                    {directions.slice(0, 2).map((d) => (
                      <span key={d} className="chip" style={{ fontSize: '.72rem', padding: '3px 8px' }}>
                        {d}
                      </span>
                    ))}
                  </div>
                  <span className="small strong" style={{ color: 'var(--brand-strong)' }}>
                    {casesCount} {plural(casesCount, 'кейс', 'кейса', 'кейсов')} <ArrowRight size={13} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="cta-banner mt-48">
          <div>
            <span className="eyebrow" style={{ color: '#c4b5fd' }}>
              Ваша компания
            </span>
            <h2>Разместите первый кейс бесплатно</h2>
            <p>Публикация занимает пять минут. Вы платите только за результат, который приняли.</p>
          </div>
          <Link to="/register?role=employer" className="btn btn--primary btn--lg">
            Стать партнёром <ArrowRight size={17} />
          </Link>
        </div>
      </div>
    </div>
  )
}
