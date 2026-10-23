import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Compass,
  Database,
  GraduationCap,
  HandHeart,
  Rocket,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
} from 'lucide-react'
import { SectionHead } from '../components/ui'
import { useApp } from '../store/AppStore'

const PROBLEMS = [
  {
    icon: GraduationCap,
    title: 'Студенту нечего показать',
    text: 'Курсовые лежат в папке, а работодатель просит «релевантный опыт». Замкнутый круг, в котором нет первого проекта.',
  },
  {
    icon: Building2,
    title: 'У компании нет рук на мелкие задачи',
    text: 'Аналитика в Excel, исследование, прототип, тема для диплома — задачи есть, а выделенного человека нет.',
  },
  {
    icon: Users,
    title: 'Вузу сложно держать связь с индустрией',
    text: 'Темы ВКР берутся из учебников, а не из реальных запросов рынка. Студенты это чувствуют.',
  },
]

const PRINCIPLES = [
  {
    icon: ShieldCheck,
    title: 'Прозрачные условия',
    text: 'Сумма, сроки и критерии приёмки — до отклика, а не после.',
  },
  {
    icon: Target,
    title: 'Результат, а не процесс',
    text: 'Оплачивается принятая работа, а не количество часов в офисе.',
  },
  {
    icon: Database,
    title: 'Данные под контролем',
    text: 'Обезличенные датасеты по умолчанию, NDA — когда данных больше.',
  },
  {
    icon: HandHeart,
    title: 'Обе стороны в выигрыше',
    text: 'Студент получает опыт и деньги, компания — результат и кандидата.',
  },
]

const ROADMAP = [
  {
    period: 'Сейчас · пилот',
    title: 'Каталог и кабинеты',
    text: 'Публикация кейсов, отклики, портфолио, модерация вручную.',
    done: true,
  },
  {
    period: 'Ближайшее',
    title: 'Верификация вузов',
    text: 'Подтверждение студенческого статуса, интеграция с деканатами.',
    done: false,
  },
  {
    period: 'Дальше',
    title: 'Эскроу и договоры',
    text: 'Резервирование вознаграждения, шаблоны договоров, электронная подпись.',
    done: false,
  },
  {
    period: 'Горизонт',
    title: 'Аналитика для вузов',
    text: 'Дашборды по темам, трудоустройству и партнёрствам с компаниями.',
    done: false,
  },
]

export default function About() {
  const { state } = useApp()
  const published = state.cases.filter((c) => c.status === 'published').length
  const companies = new Set(state.cases.map((c) => c.employerId)).size
  const students = state.users.filter((u) => u.role === 'student').length

  return (
    <>
      <section className="section" style={{ paddingBottom: 30 }}>
        <div className="container">
          <span className="eyebrow">О проекте</span>
          <h1 style={{ fontSize: 'clamp(1.9rem,3.6vw,2.8rem)', marginTop: 12, maxWidth: 820 }}>
            Ступень — это переход от «учусь» к «работаю»
          </h1>
          <p className="muted mt-16" style={{ maxWidth: 680, fontSize: '1.05rem', lineHeight: 1.65 }}>
            Мы верим, что первый опыт не должен начинаться с вакансии « junior, без опыта от 3 лет».
            Студент может принести пользу компании уже на втором курсе — если задача сформулирована
            как реальный кейс с понятным результатом.
          </p>

          <div className="hero__stats mt-32">
            <div>
              <div className="hero__stat-value">{published}</div>
              <div className="hero__stat-label">кейсов в демо-каталоге</div>
            </div>
            <div>
              <div className="hero__stat-value">{companies}</div>
              <div className="hero__stat-label">компаний-партнёров</div>
            </div>
            <div>
              <div className="hero__stat-value">{students}</div>
              <div className="hero__stat-label">профиля студентов</div>
            </div>
            <div>
              <div className="hero__stat-value">1</div>
              <div className="hero__stat-label">платформа для трёх сторон</div>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--alt">
        <div className="container">
          <SectionHead
            eyebrow="Проблема"
            title="Почему это вообще нужно"
            subtitle="Три разрыва, которые платформа закрывает одновременно."
          />
          <div className="grid grid--3">
            {PROBLEMS.map((p) => (
              <div className="card" key={p.title}>
                <span className="feature__icon">
                  <p.icon size={20} />
                </span>
                <h3 style={{ marginTop: 16, fontSize: '1.02rem' }}>{p.title}</h3>
                <p className="small muted" style={{ marginTop: 8, lineHeight: 1.6 }}>
                  {p.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="grid grid--2" style={{ gap: 40, alignItems: 'center' }}>
            <div>
              <span className="eyebrow">Решение</span>
              <h2 style={{ fontSize: 'clamp(1.5rem,2.6vw,2rem)', marginTop: 12 }}>
                Один каталог — три типа задач
              </h2>
              <p className="muted mt-16" style={{ lineHeight: 1.65 }}>
                Платформа не заменяет вуз и не заменяет работодателя. Она убирает трение между
                ними: понятные условия, прозрачная оплата и результат, который можно показать.
              </p>
              <div className="stack mt-24" style={{ gap: 14 }}>
                <div className="row" style={{ gap: 10, alignItems: 'flex-start' }}>
                  <CheckCircle2 size={18} style={{ color: 'var(--success)', marginTop: 2 }} />
                  <div>
                    <div className="strong small">Стажировки и практика</div>
                    <div className="tiny muted">Работа в команде компании на срок от месяца</div>
                  </div>
                </div>
                <div className="row" style={{ gap: 10, alignItems: 'flex-start' }}>
                  <CheckCircle2 size={18} style={{ color: 'var(--success)', marginTop: 2 }} />
                  <div>
                    <div className="strong small">Курсовые и дипломы</div>
                    <div className="tiny muted">Темы с реальными данными и рецензией от бизнеса</div>
                  </div>
                </div>
                <div className="row" style={{ gap: 10, alignItems: 'flex-start' }}>
                  <CheckCircle2 size={18} style={{ color: 'var(--success)', marginTop: 2 }} />
                  <div>
                    <div className="strong small">Разовые проекты</div>
                    <div className="tiny muted">Задача с фиксированной оплатой и сроком</div>
                  </div>
                </div>
              </div>
              <Link to="/cases" className="btn btn--primary mt-24">
                Посмотреть каталог <ArrowRight size={16} />
              </Link>
            </div>

            <div className="card" style={{ background: 'var(--gradient-soft)', borderColor: 'color-mix(in srgb, var(--brand) 22%, var(--line))' }}>
              <div className="row" style={{ gap: 10 }}>
                <Compass size={20} style={{ color: 'var(--brand-strong)' }} />
                <span className="strong">Для кого</span>
              </div>
              <div className="stack mt-16" style={{ gap: 18 }}>
                <div>
                  <div className="small strong">Студент</div>
                  <div className="tiny muted">
                    Ищет первый опыт, деньги на жизнь и тему для ВКР. Собирает портфолио.
                  </div>
                </div>
                <div>
                  <div className="small strong">Компания</div>
                  <div className="tiny muted">
                    Закрывает задачи, до которых не доходят руки, и присматривает кандидатов.
                  </div>
                </div>
                <div>
                  <div className="small strong">Вуз</div>
                  <div className="tiny muted">
                    Получает актуальные темы, партнёрства и данные о трудоустройстве.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--alt">
        <div className="container">
          <SectionHead eyebrow="Принципы" title="Во что мы не будем играть" />
          <div className="grid grid--4" style={{ gap: 22 }}>
            {PRINCIPLES.map((p) => (
              <div className="feature" key={p.title}>
                <span className="feature__icon">
                  <p.icon size={19} />
                </span>
                <div>
                  <h3>{p.title}</h3>
                  <p>{p.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHead eyebrow="Roadmap" title="Куда движется проект" />
          <div className="grid grid--4" style={{ gap: 16 }}>
            {ROADMAP.map((r) => (
              <div className="card card--pad-sm" key={r.title} style={{ opacity: r.done ? 1 : 0.82 }}>
                <div className="row row--between">
                  <span className={`badge badge--${r.done ? 'success' : 'outline'}`}>{r.period}</span>
                  {r.done ? <CheckCircle2 size={16} style={{ color: 'var(--success)' }} /> : <Rocket size={15} style={{ color: 'var(--muted)' }} />}
                </div>
                <h3 style={{ fontSize: '.98rem', marginTop: 14 }}>{r.title}</h3>
                <p className="tiny muted" style={{ marginTop: 6, lineHeight: 1.55 }}>
                  {r.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="faq">
        <div className="container container--narrow">
          <div className="card" style={{ padding: 32 }}>
            <div className="row" style={{ gap: 10 }}>
              <Sparkles size={20} style={{ color: 'var(--brand)' }} />
              <h2 style={{ fontSize: '1.3rem' }}>Это прототип</h2>
            </div>
            <p className="muted mt-16" style={{ lineHeight: 1.7 }}>
              Сайт, на котором вы находитесь, — рабочая демонстрация платформы. Здесь можно
              зарегистрироваться, размещать кейсы, откликаться и собирать портфолио, но данные
              хранятся только в вашем браузере: реальные компании и платежи не подключены, а
              демо-аккаунты созданы для примера.
            </p>
            <p className="muted mt-16" style={{ lineHeight: 1.7 }}>
              Сбросить состояние можно в личном кабинете. Для запуска реальной версии нужны сервер,
              база данных, модерация и договоры с компаниями — это следующий этап проекта.
            </p>
            <div className="row mt-24" style={{ flexWrap: 'wrap' }}>
              <Link to="/cases" className="btn btn--primary">
                Попробовать каталог
              </Link>
              <a href="mailto:hello@stupen.ru" className="btn btn--outline">
                Написать команде
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
