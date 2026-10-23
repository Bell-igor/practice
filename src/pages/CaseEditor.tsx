import { useMemo, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import {
  AlertCircle,
  ArrowLeft,
  Briefcase,
  CheckCircle2,
  Info,
  Lightbulb,
  Plus,
  Save,
  Trash2,
} from 'lucide-react'
import { useApp } from '../store/AppStore'
import {
  DIRECTIONS,
  FORMAT_LABELS,
  TYPE_DESCRIPTIONS,
  TYPE_LABELS,
  formatMoney,
} from '../data/dictionaries'
import type { CaseType, RewardType, WorkFormat } from '../types'
import { Field } from '../components/ui'

const ALL_TYPES = Object.keys(TYPE_LABELS) as CaseType[]
const ALL_FORMATS = Object.keys(FORMAT_LABELS) as WorkFormat[]
const REWARD_TYPES: { key: RewardType; label: string }[] = [
  { key: 'money', label: 'Деньги' },
  { key: 'offer', label: 'Оффер' },
  { key: 'gift', label: 'Подарки' },
  { key: 'none', label: 'Без оплаты' },
]

function toDateInput(iso: string): string {
  const d = new Date(iso)
  const off = d.getTimezoneOffset()
  return new Date(d.getTime() - off * 60_000).toISOString().slice(0, 10)
}

export default function CaseEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentUser, getCase, saveCase, deleteCase, notify } = useApp()

  const existing = id ? getCase(id) : undefined

  const [title, setTitle] = useState(existing?.title ?? '')
  const [type, setType] = useState<CaseType>(existing?.type ?? 'internship')
  const [direction, setDirection] = useState(existing?.direction ?? DIRECTIONS[0])
  const [format, setFormat] = useState<WorkFormat>(existing?.format ?? 'hybrid')
  const [city, setCity] = useState(existing?.city ?? currentUser?.city ?? 'Москва')
  const [duration, setDuration] = useState(existing?.duration ?? '3 месяца')
  const [deadline, setDeadline] = useState(
    toDateInput(existing?.deadline ?? new Date(Date.now() + 30 * 86_400_000).toISOString()),
  )
  const [slots, setSlots] = useState(String(existing?.slots ?? 1))
  const [rewardType, setRewardType] = useState<RewardType>(existing?.reward.type ?? 'money')
  const [rewardAmount, setRewardAmount] = useState(String(existing?.reward.amount ?? 30000))
  const [rewardNote, setRewardNote] = useState(existing?.reward.note ?? '')
  const [summary, setSummary] = useState(existing?.summary ?? '')
  const [description, setDescription] = useState(existing?.description ?? '')
  const [tasks, setTasks] = useState((existing?.tasks ?? ['']).join('\n'))
  const [requirements, setRequirements] = useState((existing?.requirements ?? ['']).join('\n'))
  const [outcomes, setOutcomes] = useState(
    (existing?.outcomes ?? ['Запись в портфолио', 'Отзыв наставника', 'Возможность оффера']).join('\n'),
  )
  const [skills, setSkills] = useState((existing?.skills ?? []).join(', '))
  const [mentor, setMentor] = useState(existing?.mentor ?? '')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const lineList = (value: string) => value.split('\n').map((s) => s.trim()).filter(Boolean)
  const skillList = useMemo(
    () => skills.split(',').map((s) => s.trim()).filter(Boolean),
    [skills],
  )

  if (!currentUser) return <Navigate to="/login?next=/case/new" replace />
  if (currentUser.role !== 'employer') {
    return (
      <div className="page">
        <div className="container container--narrow">
          <div className="card" style={{ textAlign: 'center', padding: 40 }}>
            <Briefcase size={28} style={{ color: 'var(--brand)' }} />
            <h2 style={{ marginTop: 14 }}>Кейсы размещают работодатели</h2>
            <p className="muted" style={{ marginTop: 8 }}>
              Ваш аккаунт — студенческий. Создайте аккаунт работодателя, чтобы публиковать кейсы.
            </p>
            <Link to="/register?role=employer" className="btn btn--primary mt-24">
              Создать аккаунт работодателя
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (id && (!existing || existing.employerId !== currentUser.id)) {
    return (
      <div className="page">
        <div className="container container--narrow">
          <div className="card" style={{ textAlign: 'center', padding: 40 }}>
            <AlertCircle size={28} style={{ color: 'var(--danger)' }} />
            <h2 style={{ marginTop: 14 }}>Кейс недоступен</h2>
            <p className="muted" style={{ marginTop: 8 }}>
              Он не найден или принадлежит другой компании.
            </p>
            <Link to="/dashboard" className="btn btn--primary mt-24">
              В кабинет
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const validate = () => {
    const next: Record<string, string> = {}
    if (title.trim().length < 10) next.title = 'Минимум 10 символов'
    if (summary.trim().length < 30) next.summary = 'Опишите задачу в 1–2 предложениях (от 30 символов)'
    if (description.trim().length < 80) next.description = 'Добавьте детали: контекст, данные, ожидаемый результат'
    if (lineList(tasks).length < 2) next.tasks = 'Нужно минимум две задачи'
    if (lineList(requirements).length < 1) next.requirements = 'Опишите хотя бы одно требование'
    if (rewardType === 'money' && (!rewardAmount || Number(rewardAmount) <= 0)) {
      next.rewardAmount = 'Укажите сумму вознаграждения'
    }
    if (!deadline || new Date(deadline).getTime() < Date.now()) {
      next.deadline = 'Дедлайн должен быть в будущем'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) {
      notify('Проверьте выделенные поля', 'error')
      return
    }

    const res = saveCase({
      id: existing?.id,
      title: title.trim(),
      type,
      direction,
      format,
      city: city.trim(),
      summary: summary.trim(),
      description: description.trim(),
      tasks: lineList(tasks),
      requirements: lineList(requirements),
      skills: skillList,
      duration: duration.trim(),
      deadline: new Date(`${deadline}T23:59:59`).toISOString(),
      slots: Math.max(1, Number(slots) || 1),
      reward: {
        type: rewardType,
        amount: rewardType === 'money' ? Number(rewardAmount) : undefined,
        note:
          rewardNote.trim() ||
          (rewardType === 'money'
            ? `${formatMoney(Number(rewardAmount))} за результат`
            : REWARD_TYPES.find((r) => r.key === rewardType)?.label ?? ''),
      },
      outcomes: lineList(outcomes),
      mentor: mentor.trim() || undefined,
      featured: existing?.featured,
    })

    if (!res.ok) {
      notify(res.error ?? 'Не удалось сохранить кейс', 'error')
      return
    }
    notify(existing ? 'Кейс обновлён' : 'Кейс опубликован — он уже в каталоге')
    navigate(`/cases/${res.id}`)
  }

  return (
    <div className="page">
      <div className="container">
        <Link to="/dashboard" className="btn btn--ghost btn--sm" style={{ marginBottom: 12 }}>
          <ArrowLeft size={15} /> В кабинет
        </Link>

        <div className="row row--between row--wrap" style={{ alignItems: 'flex-end', marginBottom: 24 }}>
          <div>
            <span className="eyebrow">{existing ? 'Редактирование' : 'Новый кейс'}</span>
            <h1 style={{ fontSize: 'clamp(1.6rem,2.8vw,2.1rem)', marginTop: 10 }}>
              {existing ? 'Обновите условия кейса' : 'Разместите задачу для студентов'}
            </h1>
            <p className="muted" style={{ marginTop: 8, maxWidth: 620 }}>
              Чем конкретнее задача и критерии приёмки, тем качественнее отклики. Кейс появится в
              каталоге сразу после публикации.
            </p>
          </div>
          {existing && (
            <button
              className="btn btn--danger btn--sm"
              onClick={() => {
                if (!window.confirm('Удалить кейс? Действие необратимо.')) return
                deleteCase(existing.id)
                notify('Кейс удалён', 'info')
                navigate('/dashboard')
              }}
            >
              <Trash2 size={14} /> Удалить кейс
            </button>
          )}
        </div>

        <form onSubmit={submit} className="detail" style={{ alignItems: 'start' }}>
          <div className="detail__main">
            <div className="card">
              <h2 className="card-title">Основное</h2>
              <div className="stack" style={{ gap: 18 }}>
                <Field label="Заголовок кейса" required error={errors.title} hint="Например: «Стажёр-аналитик: дашборды для ритейла»">
                  <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Коротко и по делу" />
                </Field>

                <div>
                  <span className="label">Тип предложения <span style={{ color: 'var(--danger)' }}>*</span></span>
                  <div className="chips mt-8">
                    {ALL_TYPES.map((t) => (
                      <button
                        type="button"
                        key={t}
                        className={`chip chip--button${type === t ? ' chip--active' : ''}`}
                        onClick={() => setType(t)}
                      >
                        {TYPE_LABELS[t]}
                      </button>
                    ))}
                  </div>
                  <div className="field__hint" style={{ marginTop: 6 }}>
                    {TYPE_DESCRIPTIONS[type]}
                  </div>
                </div>

                <div className="form-grid">
                  <Field label="Направление">
                    <select className="input" value={direction} onChange={(e) => setDirection(e.target.value)}>
                      {DIRECTIONS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Формат">
                    <select className="input" value={format} onChange={(e) => setFormat(e.target.value as WorkFormat)}>
                      {ALL_FORMATS.map((f) => (
                        <option key={f} value={f}>
                          {FORMAT_LABELS[f]}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Город">
                    <input className="input" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Москва" />
                  </Field>
                  <Field label="Длительность">
                    <input className="input" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="3 месяца" />
                  </Field>
                  <Field label="Дедлайн" required error={errors.deadline}>
                    <input className="input" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
                  </Field>
                  <Field label="Количество мест">
                    <input className="input" type="number" min={1} value={slots} onChange={(e) => setSlots(e.target.value)} />
                  </Field>
                </div>

                <Field label="Краткое описание" required error={errors.summary} hint="Показывается в карточке каталога — 1–2 предложения">
                  <textarea className="textarea" value={summary} onChange={(e) => setSummary(e.target.value)} rows={3} placeholder="Что нужно сделать и что получит студент" />
                </Field>

                <Field label="Подробное описание" required error={errors.description} hint="Контекст, данные, ожидаемый результат. Абзацы разделяйте пустой строкой">
                  <textarea className="textarea" value={description} onChange={(e) => setDescription(e.target.value)} rows={8} />
                </Field>
              </div>
            </div>

            <div className="card">
              <h2 className="card-title">Задачи и требования</h2>
              <div className="stack" style={{ gap: 18 }}>
                <Field label="Что нужно сделать" required error={errors.tasks} hint="Одна задача — одна строка">
                  <textarea className="textarea" value={tasks} onChange={(e) => setTasks(e.target.value)} rows={5} placeholder={'Собрать дашборд\nПровести 5 интервью\nОформить отчёт'} />
                </Field>
                <Field label="Требования к студенту" required error={errors.requirements} hint="Одна строка — одно требование">
                  <textarea className="textarea" value={requirements} onChange={(e) => setRequirements(e.target.value)} rows={4} />
                </Field>
                <Field label="Навыки" hint="Через запятую — по ним работает поиск">
                  <input className="input" value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="SQL, Python, Tableau" />
                </Field>
                <Field label="Что получит студент" hint="Кроме денег: отзыв, оффер, публикация">
                  <textarea className="textarea" value={outcomes} onChange={(e) => setOutcomes(e.target.value)} rows={3} />
                </Field>
                <Field label="Наставник" hint="Кто отвечает на вопросы студента">
                  <input className="input" value={mentor} onChange={(e) => setMentor(e.target.value)} placeholder="Имя, должность" />
                </Field>
              </div>
            </div>

            <div className="card">
              <h2 className="card-title">Вознаграждение</h2>
              <div className="chips" style={{ marginBottom: 18 }}>
                {REWARD_TYPES.map((r) => (
                  <button
                    type="button"
                    key={r.key}
                    className={`chip chip--button${rewardType === r.key ? ' chip--active' : ''}`}
                    onClick={() => setRewardType(r.key)}
                  >
                    {r.label}
                  </button>
                ))}
              </div>

              {rewardType === 'money' && (
                <div className="form-grid">
                  <Field label="Сумма, ₽" required error={errors.rewardAmount}>
                    <input className="input" type="number" min={0} step={1000} value={rewardAmount} onChange={(e) => setRewardAmount(e.target.value)} />
                  </Field>
                  <Field label="Как выплачивается">
                    <input className="input" value={rewardNote} onChange={(e) => setRewardNote(e.target.value)} placeholder="Например: 50% аванс, 50% по приёмке" />
                  </Field>
                </div>
              )}

              {rewardType !== 'money' && (
                <Field label="Что получает студент">
                  <input className="input" value={rewardNote} onChange={(e) => setRewardNote(e.target.value)} placeholder="Оффер по итогам, техника, сертификат…" />
                </Field>
              )}

              <div className="alert alert--info mt-16">
                <Info size={16} />
                <span>
                  Платформа не проводит платежи в демо-версии: условия фиксируются в описании кейса
                  и в переписке с кандидатом.
                </span>
              </div>
            </div>

            <div className="row" style={{ justifyContent: 'flex-end' }}>
              <Link to="/dashboard" className="btn btn--ghost">
                Отмена
              </Link>
              <button className="btn btn--primary btn--lg" type="submit">
                <Save size={17} /> {existing ? 'Сохранить изменения' : 'Опубликовать кейс'}
              </button>
            </div>
          </div>

          <aside className="sidebar-card">
            <div className="card">
              <h3 className="card-title">
                <Lightbulb size={17} style={{ color: 'var(--accent)' }} /> Как получить отклики
              </h3>
              <ul className="checklist checklist--muted" style={{ gap: 10 }}>
                <li>
                  <CheckCircle2 /> <span>Конкретный результат: «дашборд из 5 отчётов», а не «помощь с аналитикой»</span>
                </li>
                <li>
                  <CheckCircle2 /> <span>Честные сроки: студент совмещает кейс с учёбой</span>
                </li>
                <li>
                  <CheckCircle2 /> <span>Понятное вознаграждение и способ выплаты</span>
                </li>
                <li>
                  <CheckCircle2 /> <span>Наставник, который отвечает раз в неделю</span>
                </li>
              </ul>
            </div>

            <div className="card card--pad-sm">
              <div className="row row--between">
                <span className="small strong">Предпросмотр</span>
                <span className="badge badge--outline">{TYPE_LABELS[type]}</span>
              </div>
              <h3 style={{ fontSize: '1rem', marginTop: 12 }}>{title || 'Заголовок кейса'}</h3>
              <p className="small muted" style={{ marginTop: 8, lineHeight: 1.55 }}>
                {summary || 'Краткое описание появится здесь.'}
              </p>
              <div className="row row--between mt-16">
                <span className="tiny muted">
                  {city} · {duration}
                </span>
                <span className="reward">
                  {rewardType === 'money' ? formatMoney(Number(rewardAmount)) : REWARD_TYPES.find((r) => r.key === rewardType)?.label}
                </span>
              </div>
              <hr className="divider" />
              <div className="chips">
                {skillList.length ? (
                  skillList.slice(0, 5).map((s) => (
                    <span key={s} className="chip" style={{ fontSize: '.72rem' }}>
                      {s}
                    </span>
                  ))
                ) : (
                  <span className="tiny muted">Навыки не указаны</span>
                )}
              </div>
            </div>

            <div className="card card--pad-sm">
              <div className="row" style={{ gap: 8 }}>
                <Plus size={15} style={{ color: 'var(--brand)' }} />
                <span className="small strong">Несколько кейсов?</span>
              </div>
              <p className="tiny muted mt-8" style={{ lineHeight: 1.5 }}>
                Разместите отдельные задачи под разные роли — так проще сравнивать отклики.
              </p>
            </div>
          </aside>
        </form>
      </div>
    </div>
  )
}
