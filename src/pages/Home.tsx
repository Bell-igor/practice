import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Award,
  BadgeCheck,
  BookOpen,
  Briefcase,
  CheckCircle2,
  Clock3,
  FileText,
  GraduationCap,
  Landmark,
  Quote,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import { useApp } from '../store/AppStore'
import { DIRECTIONS, TYPE_LABELS } from '../data/dictionaries'
import { DirectionIcon } from '../components/DirectionIcon'
import CaseCard from '../components/CaseCard'
import { SectionHead, TypeBadge } from '../components/ui'
import type { CaseType } from '../types'

const HOW_STUDENTS = [
  {
    title: 'Найди свой кейс',
    text: 'Фильтруй по направлению, формату и типу: стажировка, практика, тема курсовой или диплома.',
    icon: Search,
  },
  {
    title: 'Откликнись за минуту',
    text: 'Расскажи о себе и опыте. Компания видит твой профиль и портфолио, а не только резюме.',
    icon: FileText,
  },
  {
    title: 'Работай с наставником',
    text: 'Реальные данные, реальные сроки и человек, который отвечает на вопросы.',
    icon: Sparkles,
  },
  {
    title: 'Получи оплату и оффер',
    text: 'Вознаграждение за результат, запись в портфолио и приглашение в штат — по итогам.',
    icon: Award,
  },
]

const HOW_EMPLOYERS = [
  {
    title: 'Опиши задачу',
    text: 'Пять минут на форму: что нужно сделать, какие данные даёшь и что получит студент.',
    icon: FileText,
  },
  {
    title: 'Получи отклики',
    text: 'Кандидаты приходят с профилем и портфолио. Отклики можно фильтровать и сравнивать.',
    icon: TrendingUp,
  },
  {
    title: 'Выбери исполнителя',
    text: 'Свяжись в один клик, согласуй сроки и вознаграждение прямо на платформе.',
    icon: BadgeCheck,
  },
  {
    title: 'Проверь в деле',
    text: 'Смотри, как студент работает над реальной задачей, — и приглашай лучших в команду.',
    icon: Briefcase,
  },
]

const FAQ = [
  {
    q: 'Кто может размещать кейсы?',
    a: 'Любая компания — от стартапа до корпорации. Нужен только аккаунт работодателя: модерация занимает до одного рабочего дня, после этого кейс виден в каталоге.',
  },
  {
    q: 'Это платно для студентов?',
    a: 'Нет. Студенты пользуются платформой бесплатно: отклики, избранное, портфолио и все кейсы доступны без подписки.',
  },
  {
    q: 'Как происходит оплата?',
    a: 'Компания указывает вознаграждение при публикации. Сумма фиксируется в договорённости, а платформа напоминает о сроках выплаты. В демо-версии оплата не проводится — это прототип.',
  },
  {
    q: 'Тема курсовой или диплома действительно настоящая?',
    a: 'Да, это запрос бизнеса: компания даёт реальный датасет, задачу и обратную связь. Работа остаётся у студента и в вузе, компания получает результат исследования.',
  },
  {
    q: 'Что если работа не устроит компанию?',
    a: 'Стороны фиксируют критерии приёмки до старта. Если результат не соответствует критериям, компания может вернуть задачу на доработку — это прописано в условиях кейса.',
  },
]

export default function Home() {
  const { state } = useApp()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [mode, setMode] = useState<'student' | 'employer'>('student')

  const published = useMemo(() => state.cases.filter((c) => c.status === 'published'), [state.cases])
  const featured = useMemo(() => published.filter((c) => c.featured).slice(0, 3), [published])
  const companies = useMemo(() => new Set(published.map((c) => c.employerId)).size, [published])
  const offers = state.applications.filter((a) => a.status === 'accepted').length
  const fund = useMemo(
    () => published.reduce((sum, c) => sum + (c.reward.type === 'money' ? c.reward.amount ?? 0 : 0), 0),
    [published],
  )

  const directionCounts = useMemo(() => {
    const map = new Map<string, number>()
    for (const c of published) map.set(c.direction, (map.get(c.direction) ?? 0) + 1)
    return map
  }, [published])

  const typeCounts = useMemo(() => {
    const map = new Map<CaseType, number>()
    for (const c of published) map.set(c.type, (map.get(c.type) ?? 0) + 1)
    return map
  }, [published])

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault()
    navigate(query.trim() ? `/cases?q=${encodeURIComponent(query.trim())}` : '/cases')
  }

  const steps = mode === 'student' ? HOW_STUDENTS : HOW_EMPLOYERS

  return (
    <>
      <section className="hero">
        <div className="hero__grid-lines" aria-hidden="true" />
        <div className="container hero__inner">
          <div>
            <span className="eyebrow">Пилотный запуск · {companies} компаний</span>
            <h1>
              Начни карьеру с <em>реального кейса</em>, а не с учебного примера
            </h1>
            <p className="hero__lead">
              Компании публикуют задачи, стажировки и темы для курсовых и дипломов. Ты берёшь
              кейс, доводишь его до результата с наставником, получаешь вознаграждение и оффер.
            </p>

            <form className="searchbar mt-24" onSubmit={submitSearch} role="search">
              <Search size={18} aria-hidden="true" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Python, аналитика, дизайн, диплом…"
                aria-label="Поиск по кейсам"
              />
              <button type="submit" className="btn btn--primary">
                Найти кейс
              </button>
            </form>

            <div className="hero__actions">
              <Link to="/cases" className="btn btn--outline btn--lg">
                Смотреть каталог <ArrowRight size={17} />
              </Link>
              <Link to="/register?role=employer" className="btn btn--ghost btn--lg">
                Я работодатель
              </Link>
            </div>

            <div className="hero__stats">
              <div>
                <div className="hero__stat-value">{published.length}</div>
                <div className="hero__stat-label">активных кейсов</div>
              </div>
              <div>
                <div className="hero__stat-value">{companies}</div>
                <div className="hero__stat-label">компаний</div>
              </div>
              <div>
                <div className="hero__stat-value">{Math.round(fund / 1000)} тыс. ₽</div>
                <div className="hero__stat-label">вознаграждений</div>
              </div>
              <div>
                <div className="hero__stat-value">{offers}</div>
                <div className="hero__stat-label">офферов уже сейчас</div>
              </div>
            </div>
          </div>

          <div className="hero__visual" aria-hidden="true">
            <div className="preview">
              <div className="preview__head">
                <span className="preview__dot" />
                <span className="preview__dot" />
                <span className="preview__dot" />
                <span className="tiny muted" style={{ marginLeft: 8 }}>
                  ступень.рф / кейсы
                </span>
              </div>
              <div className="preview__body">
                {featured.map((c, i) => {
                  const employer = state.users.find((u) => u.id === c.employerId)
                  return (
                    <div
                      key={c.id}
                      className={`preview__item${i === 0 ? ' preview__item--active' : ''}`}
                    >
                      <span
                        className="avatar avatar--sm"
                        style={{ background: employer?.avatarColor ?? 'var(--brand)' }}
                      >
                        <DirectionIcon direction={c.direction} size={14} />
                      </span>
                      <div style={{ minWidth: 0 }}>
                        <div className="preview__item-title">{c.title}</div>
                        <div className="tiny muted">
                          {employer?.company} · {c.reward.amount ? `${c.reward.amount.toLocaleString('ru-RU')} ₽` : 'по итогам'}
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div className="preview__item">
                  <span className="avatar avatar--sm" style={{ background: 'var(--surface-2)', color: 'var(--muted)' }}>
                    <GraduationCap size={14} />
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <div className="preview__item-title">Тема диплома: скоринг для МСП</div>
                    <div className="tiny muted">ФинПульс · 70 000 ₽</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="preview__float">
              <span className="preview__float-icon">
                <CheckCircle2 size={18} />
              </span>
              <div>
                <div className="tiny strong">Отклик принят</div>
                <div className="tiny muted">Арктика Софт · стажировка</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHead
            eyebrow="Направления"
            title="Найди свою область"
            subtitle="От кода и данных до дизайна и финансов — в каждом направлении есть задачи с реальным результатом."
            action={
              <Link to="/cases" className="btn btn--outline">
                Все кейсы <ArrowRight size={16} />
              </Link>
            }
          />
          <div className="grid grid--4" style={{ gap: 14 }}>
            {DIRECTIONS.map((d) => (
              <Link
                key={d}
                to={`/cases?direction=${encodeURIComponent(d)}`}
                className="tile"
              >
                <span className="tile__icon">
                  <DirectionIcon direction={d} />
                </span>
                <span>
                  <span className="tile__title" style={{ display: 'block' }}>
                    {d}
                  </span>
                  <span className="tile__count">
                    {directionCounts.get(d) ?? 0} кейсов
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--alt">
        <div className="container">
          <SectionHead
            eyebrow="Процесс"
            title="Как это работает"
            subtitle="Прозрачно для обеих сторон: понятные шаги, сроки и вознаграждение."
            action={
              <div className="switch-tabs" role="tablist">
                <button
                  className={mode === 'student' ? 'active' : ''}
                  onClick={() => setMode('student')}
                  role="tab"
                  aria-selected={mode === 'student'}
                >
                  Студентам
                </button>
                <button
                  className={mode === 'employer' ? 'active' : ''}
                  onClick={() => setMode('employer')}
                  role="tab"
                  aria-selected={mode === 'employer'}
                >
                  Работодателям
                </button>
              </div>
            }
          />
          <div className="steps">
            {steps.map((s, i) => (
              <div className="step" key={s.title}>
                <div className="step__num">{String(i + 1).padStart(2, '0')}</div>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHead
            eyebrow="Каталог"
            title="Кейсы, которые стоит забрать"
            subtitle="Выбор редакции: задачи, где компания готова платить за результат."
            action={
              <Link to="/cases" className="btn btn--ghost">
                Смотреть все <ArrowRight size={16} />
              </Link>
            }
          />
          <div className="cases-grid">
            {featured.map((c) => (
              <CaseCard key={c.id} item={c} employer={state.users.find((u) => u.id === c.employerId)} />
            ))}
          </div>

          <div className="row row--wrap mt-32" style={{ gap: 10 }}>
            {(Object.keys(TYPE_LABELS) as CaseType[])
              .filter((t) => t !== 'project')
              .map((t) => (
                <Link key={t} to={`/cases?type=${t}`} className="chip chip--button">
                  <TypeBadge type={t} />
                  <span className="muted">{typeCounts.get(t) ?? 0}</span>
                </Link>
              ))}
          </div>
        </div>
      </section>

      <section className="section section--alt">
        <div className="container">
          <SectionHead
            eyebrow="Зачем это тебе"
            title="Не учебный проект в стол, а строчка в резюме"
            subtitle="Четыре вещи, которые студент получает от каждого кейса на платформе."
          />
          <div className="grid grid--4" style={{ gap: 26 }}>
            <div className="feature">
              <span className="feature__icon feature__icon--success">
                <Wallet size={20} />
              </span>
              <div>
                <h3>Оплата за результат</h3>
                <p>Вознаграждение указано до отклика. Никаких «по итогам собеседования».</p>
              </div>
            </div>
            <div className="feature">
              <span className="feature__icon">
                <Briefcase size={20} />
              </span>
              <div>
                <h3>Настоящее портфолио</h3>
                <p>Проект с реальными данными и ссылкой — сильнее учебной работы.</p>
              </div>
            </div>
            <div className="feature">
              <span className="feature__icon feature__icon--accent">
                <ShieldCheck size={20} />
              </span>
              <div>
                <h3>Наставник</h3>
                <p>У каждого кейса есть контактное лицо в компании и критерии приёмки.</p>
              </div>
            </div>
            <div className="feature">
              <span className="feature__icon">
                <GraduationCap size={20} />
              </span>
              <div>
                <h3>Тема для ВКР</h3>
                <p>Курсовые и дипломы на запросах бизнеса — с данными и рецензией.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="cta-banner">
            <div>
              <span className="eyebrow" style={{ color: '#c4b5fd' }}>
                Для компаний
              </span>
              <h2>Студенты решают задачи, до которых не доходят руки</h2>
              <p>
                Разместите кейс за пять минут: тема курсовой, исследование, прототип или
                стажировка. Вы платите только за результат, который приняли.
              </p>
            </div>
            <div className="row" style={{ gap: 12, flexWrap: 'wrap' }}>
              <Link to="/register?role=employer" className="btn btn--primary btn--lg">
                Разместить кейс <ArrowRight size={17} />
              </Link>
              <Link to="/how" className="btn btn--outline btn--lg" style={{ background: 'transparent', color: '#fff', borderColor: 'rgba(255,255,255,.28)' }}>
                Условия
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--alt">
        <div className="container">
          <SectionHead eyebrow="Отзывы" title="Что говорят участники" />
          <div className="grid grid--3">
            <div className="quote">
              <Quote size={20} style={{ color: 'var(--brand)' }} />
              <p>
                Взяла кейс по дашбордам, потому что в резюме нечего было показать. Через три
                месяца у меня был проект в портфолио и приглашение на джуна.
              </p>
              <div className="quote__author">
                <span className="avatar" style={{ background: '#8b5cf6' }}>
                  АК
                </span>
                <div>
                  <div className="small strong">Анна Ковалёва</div>
                  <div className="tiny muted">НИУ ВШЭ, 3 курс · анализ данных</div>
                </div>
              </div>
            </div>
            <div className="quote">
              <Quote size={20} style={{ color: 'var(--brand)' }} />
              <p>
                Мы отдали на платформу три темы для дипломов. Две работы уже используются в
                пилоте — дешевле и быстрее, чем нанимать подрядчика.
              </p>
              <div className="quote__author">
                <span className="avatar" style={{ background: '#0ea5e9' }}>
                  ПД
                </span>
                <div>
                  <div className="small strong">Павел Дементьев</div>
                  <div className="tiny muted">Арктика Софт · технический директор</div>
                </div>
              </div>
            </div>
            <div className="quote">
              <Quote size={20} style={{ color: 'var(--brand)' }} />
              <p>
                Для агентства это способ находить людей без дорогих job-бордов: смотришь, как
                человек работает, а не что написано в резюме.
              </p>
              <div className="quote__author">
                <span className="avatar" style={{ background: '#f97316' }}>
                  ОП
                </span>
                <div>
                  <div className="small strong">Ольга Пименова</div>
                  <div className="tiny muted">Медиана · HR-партнёр</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="faq">
        <div className="container container--narrow">
          <SectionHead eyebrow="FAQ" title="Частые вопросы" />
          <div className="faq">
            {FAQ.map((item) => (
              <details key={item.q}>
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>

          <div className="card mt-32" style={{ display: 'flex', gap: 18, alignItems: 'center', flexWrap: 'wrap' }}>
            <span className="feature__icon">
              <Landmark size={20} />
            </span>
            <div style={{ flex: 1, minWidth: 240 }}>
              <div className="strong">Хочешь разместить кейс от вуза или компании?</div>
              <div className="small muted">Напишите нам — поможем оформить задачу и условия.</div>
            </div>
            <a href="mailto:hello@stupen.ru" className="btn btn--outline">
              hello@stupen.ru
            </a>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="card" style={{ padding: 40, textAlign: 'center', background: 'var(--gradient-soft)', borderColor: 'color-mix(in srgb, var(--brand) 22%, var(--line))' }}>
            <h2 style={{ fontSize: 'clamp(1.5rem,2.6vw,2rem)' }}>Следующая ступень — за тобой</h2>
            <p className="muted" style={{ marginTop: 10 }}>
              Создай профиль, откликнись на первый кейс и начни собирать портфолио уже на этой неделе.
            </p>
            <div className="row" style={{ justifyContent: 'center', marginTop: 22, flexWrap: 'wrap' }}>
              <Link to="/register" className="btn btn--primary btn--lg">
                <GraduationCap size={18} /> Я студент
              </Link>
              <Link to="/register?role=employer" className="btn btn--outline btn--lg">
                <BookOpen size={18} /> Я работодатель
              </Link>
            </div>
            <div className="info-strip" style={{ justifyContent: 'center', marginTop: 18 }}>
              <span>
                <Clock3 size={14} /> Регистрация — 1 минута
              </span>
              <span>
                <BadgeCheck size={14} /> Без оплаты для студентов
              </span>
              <span>
                <ShieldCheck size={14} /> Демо-данные в браузере
              </span>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
