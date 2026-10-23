import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  BookOpen,
  Briefcase,
  CheckCircle2,
  Clock,
  FileCheck2,
  GraduationCap,
  Handshake,
  MessageSquare,
  Scale,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
} from 'lucide-react'
import { SectionHead } from '../components/ui'

const STUDENT_STEPS = [
  {
    title: 'Регистрация и профиль',
    text: 'Заполните вуз, курс, навыки и добавьте 1–2 работы в портфолио. Это займёт 5 минут, но именно профиль видит работодатель вместо строчки в резюме.',
    icon: GraduationCap,
  },
  {
    title: 'Выбор кейса',
    text: 'В каталоге есть стажировки, практика, разовые проекты и темы для курсовых и дипломов. Фильтруйте по направлению, формату и наличию оплаты.',
    icon: Target,
  },
  {
    title: 'Отклик',
    text: 'Напишите, почему вам интересна задача и что уже делали похожего. Отклик видит только компания — публичной заявки нет.',
    icon: MessageSquare,
  },
  {
    title: 'Работа с наставником',
    text: 'Компания подтверждает условия, вы согласуете график и критерии приёмки. Наставник отвечает на вопросы по задаче.',
    icon: Handshake,
  },
  {
    title: 'Сдача и вознаграждение',
    text: 'Результат принимается по заранее описанным критериям. После приёмки компания перечисляет вознаграждение и оставляет отзыв.',
    icon: Banknote,
  },
]

const EMPLOYER_STEPS = [
  {
    title: 'Публикация кейса',
    text: 'Опишите задачу, данные, требования и вознаграждение. Пять минут — и кейс в каталоге. Модерация проверяет только корректность формулировок.',
    icon: FileCheck2,
  },
  {
    title: 'Отбор откликов',
    text: 'Кандидаты приходят с профилем, навыками и портфолио. Можно принять, отправить на рассмотрение или отклонить — всё в одном списке.',
    icon: Users,
  },
  {
    title: 'Согласование условий',
    text: 'Зафиксируйте сроки, формат работы и способ выплаты. Для длительных стажировок — трудовой или гражданско-правовой договор.',
    icon: Scale,
  },
  {
    title: 'Результат и найм',
    text: 'Лучшие исполнители получают оффер. Вы уже видели, как человек работает, — риск ошибки при найме ниже.',
    icon: BadgeCheck,
  },
]

const RULES = [
  {
    title: 'Оплата за результат',
    text: 'Сумма указывается до отклика. Менять её после принятия отклика нельзя — только по согласованию со студентом.',
    icon: Banknote,
  },
  {
    title: 'Критерии приёмки',
    text: 'В описании кейса должны быть измеримые критерии: что считается готовой работой и в каком виде её сдавать.',
    icon: FileCheck2,
  },
  {
    title: 'Данные под NDA',
    text: 'Если компания передаёт реальные данные, студент подписывает соглашение о неразглашении. Обезличенные датасеты — по умолчанию.',
    icon: ShieldCheck,
  },
  {
    title: 'Права на результат',
    text: 'По умолчанию права на созданное переходят компании после выплаты вознаграждения, авторство и право показать работу в портфолио остаются у студента.',
    icon: Scale,
  },
]

const FAQ = [
  {
    q: 'Чем курсовая на платформе отличается от обычной?',
    a: 'Тема сформулирована на основе задачи компании: есть реальные данные, консультации и критерии, по которым работу оценивают практики. Студент защищает её в своём вузе, а компания получает результат исследования.',
  },
  {
    q: 'Можно ли совмещать кейс с учёбой?',
    a: 'Да, большинство кейсов рассчитаны на 10–20 часов в неделю. Компания указывает длительность и дедлайн — вы сами решаете, реально ли это совместить.',
  },
  {
    q: 'Что если компания не выплатит вознаграждение?',
    a: 'На этапе пилота мы фиксируем договорённости в переписке и сопровождаем спорные ситуации вручную. В будущем появится эскроу-счёт: деньги резервируются компанией при публикации.',
  },
  {
    q: 'Кто проверяет кейсы?',
    a: 'Модерация проверяет, что задача реальная, условия понятны, а вознаграждение указано. Кейсы «сделайте нам сайт бесплатно» не публикуются.',
  },
]

export default function How() {
  return (
    <>
      <section className="section" style={{ paddingBottom: 32 }}>
        <div className="container">
          <span className="eyebrow">Как это работает</span>
          <h1 style={{ fontSize: 'clamp(1.8rem,3.4vw,2.6rem)', marginTop: 12, maxWidth: 780 }}>
            Механика простая: задача — результат — вознаграждение
          </h1>
          <p className="muted mt-16" style={{ maxWidth: 660, fontSize: '1.02rem', lineHeight: 1.6 }}>
            Ступень соединяет три стороны: компании с реальными задачами, студентов, которым нужен
            опыт, и вузы, которым важна связь с индустрией. Ниже — полный путь для каждой стороны.
          </p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="row row--wrap" style={{ gap: 10, marginBottom: 32 }}>
            <span className="chip">
              <GraduationCap size={14} /> Студентам
            </span>
            <span className="chip">
              <Briefcase size={14} /> Работодателям
            </span>
            <span className="chip">
              <BookOpen size={14} /> Вузам
            </span>
          </div>

          <div className="grid grid--2" style={{ gap: 28, alignItems: 'start' }}>
            <div className="card">
              <div className="row" style={{ gap: 10, marginBottom: 20 }}>
                <span className="feature__icon">
                  <GraduationCap size={20} />
                </span>
                <div>
                  <h2 style={{ fontSize: '1.2rem' }}>Путь студента</h2>
                  <div className="tiny muted">От регистрации до оффера</div>
                </div>
              </div>
              <div className="stack stack--lg">
                {STUDENT_STEPS.map((s, i) => (
                  <div className="feature" key={s.title}>
                    <span className="step__num" style={{ marginBottom: 0 }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <h3>{s.title}</h3>
                      <p>{s.text}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link to="/register" className="btn btn--primary mt-24">
                Создать профиль <ArrowRight size={16} />
              </Link>
            </div>

            <div className="card">
              <div className="row" style={{ gap: 10, marginBottom: 20 }}>
                <span className="feature__icon feature__icon--accent">
                  <Briefcase size={20} />
                </span>
                <div>
                  <h2 style={{ fontSize: '1.2rem' }}>Путь компании</h2>
                  <div className="tiny muted">От задачи до найма</div>
                </div>
              </div>
              <div className="stack stack--lg">
                {EMPLOYER_STEPS.map((s, i) => (
                  <div className="feature" key={s.title}>
                    <span className="step__num" style={{ marginBottom: 0 }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <h3>{s.title}</h3>
                      <p>{s.text}</p>
                    </div>
                  </div>
                ))}
                <div className="alert alert--info">
                  <Sparkles size={16} />
                  <span>
                    Размещение первого кейса бесплатно. В демо-версии — бесплатно любое количество.
                  </span>
                </div>
              </div>
              <Link to="/register?role=employer" className="btn btn--primary mt-24">
                Разместить кейс <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--alt">
        <div className="container">
          <SectionHead
            eyebrow="Правила"
            title="Как мы защищаем обе стороны"
            subtitle="Четыре принципа, без которых платформа превращается в доску бесплатных объявлений."
          />
          <div className="grid grid--2" style={{ gap: 20 }}>
            {RULES.map((r) => (
              <div className="card card--flat" key={r.title} style={{ background: 'var(--surface)' }}>
                <div className="feature">
                  <span className="feature__icon">
                    <r.icon size={19} />
                  </span>
                  <div>
                    <h3>{r.title}</h3>
                    <p>{r.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHead eyebrow="Таймлайн" title="Сколько это занимает" />
          <div className="steps">
            <div className="step">
              <div className="step__num">
                <Clock size={16} />
              </div>
              <h3>1 день</h3>
              <p>Публикация кейса и появление в каталоге после проверки формулировок.</p>
            </div>
            <div className="step">
              <div className="step__num">
                <Users size={16} />
              </div>
              <h3>3–7 дней</h3>
              <p>Первые отклики. Кейсы с указанной оплатой получают их в 3 раза быстрее.</p>
            </div>
            <div className="step">
              <div className="step__num">
                <Handshake size={16} />
              </div>
              <h3>1–2 дня</h3>
              <p>Согласование условий и старт работы с наставником.</p>
            </div>
            <div className="step">
              <div className="step__num">
                <CheckCircle2 size={16} />
              </div>
              <h3>2 недели — 6 месяцев</h3>
              <p>Выполнение, приёмка по критериям, выплата и отзыв в портфолио.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--alt">
        <div className="container container--narrow">
          <SectionHead eyebrow="FAQ" title="Вопросы о правилах" />
          <div className="faq">
            {FAQ.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="cta-banner">
            <div>
              <span className="eyebrow" style={{ color: '#c4b5fd' }}>
                Остались вопросы
              </span>
              <h2>Разберём ваш случай лично</h2>
              <p>
                Если вы вуз, компания или студент и хотите участвовать в пилоте — напишите нам.
                Отвечаем в течение рабочего дня.
              </p>
            </div>
            <a href="mailto:hello@stupen.ru" className="btn btn--primary btn--lg">
              hello@stupen.ru <ArrowRight size={17} />
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
