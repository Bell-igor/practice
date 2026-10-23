import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Filter, RotateCcw, Search, SlidersHorizontal, X } from 'lucide-react'
import { useApp } from '../store/AppStore'
import {
  DIRECTIONS,
  FORMAT_LABELS,
  TYPE_LABELS,
  formatShortDate,
} from '../data/dictionaries'
import type { CaseType, WorkFormat } from '../types'
import CaseCard from '../components/CaseCard'
import { EmptyState } from '../components/ui'
import { DirectionIcon } from '../components/DirectionIcon'

type SortKey = 'new' | 'deadline' | 'reward'

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'new', label: 'Сначала новые' },
  { key: 'deadline', label: 'Скоро дедлайн' },
  { key: 'reward', label: 'Выше вознаграждение' },
]

const ALL_TYPES = Object.keys(TYPE_LABELS) as CaseType[]
const ALL_FORMATS = Object.keys(FORMAT_LABELS) as WorkFormat[]

function toggle(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
}

export default function Cases() {
  const { state } = useApp()
  const [params, setParams] = useSearchParams()
  const [mobileFilters, setMobileFilters] = useState(false)

  const q = params.get('q') ?? ''
  const types = (params.get('type') ?? '').split(',').filter(Boolean)
  const directions = (params.get('direction') ?? '').split(',').filter(Boolean)
  const formats = (params.get('format') ?? '').split(',').filter(Boolean)
  const paidOnly = params.get('paid') === '1'
  const sort = (params.get('sort') as SortKey) || 'new'

  const update = (key: string, value: string | null) => {
    const next = new URLSearchParams(params)
    if (value === null || value === '') next.delete(key)
    else next.set(key, value)
    setParams(next, { replace: true })
  }

  const toggleParam = (key: string, value: string, current: string[]) => {
    const nextList = toggle(current, value)
    update(key, nextList.length ? nextList.join(',') : null)
  }

  const resetAll = () => setParams(new URLSearchParams(), { replace: true })

  const allPublished = useMemo(
    () => state.cases.filter((c) => c.status === 'published'),
    [state.cases],
  )

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase()
    const filtered = allPublished.filter((c) => {
      if (types.length && !types.includes(c.type)) return false
      if (directions.length && !directions.includes(c.direction)) return false
      if (formats.length && !formats.includes(c.format)) return false
      if (paidOnly && c.reward.type !== 'money' && c.reward.type !== 'gift') return false
      if (needle) {
        const employer = state.users.find((u) => u.id === c.employerId)
        const haystack = [c.title, c.summary, c.direction, c.city, employer?.company ?? '', ...c.skills]
          .join(' ')
          .toLowerCase()
        if (!haystack.includes(needle)) return false
      }
      return true
    })

    const sorted = [...filtered]
    if (sort === 'deadline') {
      sorted.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    } else if (sort === 'reward') {
      sorted.sort(
        (a, b) =>
          (b.reward.type === 'money' ? b.reward.amount ?? 0 : 0) -
          (a.reward.type === 'money' ? a.reward.amount ?? 0 : 0),
      )
    } else {
      sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }
    return sorted
  }, [allPublished, types, directions, formats, paidOnly, q, sort, state.users])

  const countBy = (predicate: (c: (typeof allPublished)[number]) => boolean) =>
    allPublished.filter(predicate).length

  const activeFiltersCount =
    types.length + directions.length + formats.length + (paidOnly ? 1 : 0) + (q ? 1 : 0)

  const nearestDeadline = allPublished.length
    ? [...allPublished].sort(
        (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime(),
      )[0]
    : null

  return (
    <div className="page">
      <div className="container">
        <div className="row row--between row--wrap" style={{ alignItems: 'flex-end', marginBottom: 26 }}>
          <div>
            <span className="eyebrow">Каталог</span>
            <h1 style={{ fontSize: 'clamp(1.7rem,3vw,2.3rem)', marginTop: 10 }}>
              Кейсы, стажировки и темы работ
            </h1>
            <p className="muted" style={{ marginTop: 8, maxWidth: 620 }}>
              {allPublished.length} активных предложений от {new Set(allPublished.map((c) => c.employerId)).size} компаний.
              {nearestDeadline && ` Ближайший дедлайн — ${formatShortDate(nearestDeadline.deadline)}.`}
            </p>
          </div>
          <div className="searchbar" style={{ minWidth: 300, flex: '0 1 380px' }}>
            <Search size={18} />
            <input
              value={q}
              onChange={(e) => update('q', e.target.value)}
              placeholder="Поиск: навык, компания, тема"
              aria-label="Поиск по кейсам"
            />
            {q && (
              <button className="btn btn--ghost btn--sm" onClick={() => update('q', null)} aria-label="Очистить поиск">
                <X size={15} />
              </button>
            )}
          </div>
        </div>

        <div className="catalog">
          <aside className={`filters${mobileFilters ? '' : ' filters--hidden'}`}>
            <div className="row row--between">
              <div className="row" style={{ gap: 7 }}>
                <SlidersHorizontal size={16} />
                <span className="strong small">Фильтры</span>
                {activeFiltersCount > 0 && (
                  <span className="badge badge--info">{activeFiltersCount}</span>
                )}
              </div>
              {activeFiltersCount > 0 && (
                <button className="btn btn--ghost btn--sm" onClick={resetAll}>
                  <RotateCcw size={13} /> Сброс
                </button>
              )}
            </div>

            <div className="filters__group">
              <h4>Тип предложения</h4>
              <div className="filters__list">
                {ALL_TYPES.map((t) => (
                  <label key={t} className="check">
                    <input
                      type="checkbox"
                      checked={types.includes(t)}
                      onChange={() => toggleParam('type', t, types)}
                    />
                    <span>{TYPE_LABELS[t]}</span>
                    <span className="check__count">{countBy((c) => c.type === t)}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="filters__group">
              <h4>Направление</h4>
              <div className="filters__list">
                {DIRECTIONS.map((d) => (
                  <label key={d} className="check">
                    <input
                      type="checkbox"
                      checked={directions.includes(d)}
                      onChange={() => toggleParam('direction', d, directions)}
                    />
                    <span className="row" style={{ gap: 6 }}>
                      <DirectionIcon direction={d} size={14} /> {d}
                    </span>
                    <span className="check__count">{countBy((c) => c.direction === d)}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="filters__group">
              <h4>Формат</h4>
              <div className="filters__list">
                {ALL_FORMATS.map((f) => (
                  <label key={f} className="check">
                    <input
                      type="checkbox"
                      checked={formats.includes(f)}
                      onChange={() => toggleParam('format', f, formats)}
                    />
                    <span>{FORMAT_LABELS[f]}</span>
                    <span className="check__count">{countBy((c) => c.format === f)}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="filters__group">
              <h4>Вознаграждение</h4>
              <label className="check">
                <input
                  type="checkbox"
                  checked={paidOnly}
                  onChange={(e) => update('paid', e.target.checked ? '1' : null)}
                />
                <span>Только с оплатой</span>
                <span className="check__count">
                  {countBy((c) => c.reward.type === 'money' || c.reward.type === 'gift')}
                </span>
              </label>
            </div>
          </aside>

          <div>
            <div className="catalog__toolbar">
              <button
                className="btn btn--outline btn--sm filters-toggle"
                onClick={() => setMobileFilters((v) => !v)}
              >
                <Filter size={14} /> Фильтры{activeFiltersCount > 0 ? ` (${activeFiltersCount})` : ''}
              </button>
              <span className="catalog__count">
                Найдено: <strong style={{ color: 'var(--ink)' }}>{results.length}</strong>
              </span>
              <div style={{ marginLeft: 'auto' }} className="row">
                <span className="tiny muted">Сортировка:</span>
                <select
                  className="select"
                  value={sort}
                  onChange={(e) => update('sort', e.target.value)}
                  aria-label="Сортировка"
                >
                  {SORTS.map((s) => (
                    <option key={s.key} value={s.key}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {activeFiltersCount > 0 && (
              <div className="chips" style={{ marginBottom: 18 }}>
                {q && (
                  <button className="chip chip--button" onClick={() => update('q', null)}>
                    «{q}» <X size={12} />
                  </button>
                )}
                {types.map((t) => (
                  <button key={t} className="chip chip--button" onClick={() => toggleParam('type', t, types)}>
                    {TYPE_LABELS[t as CaseType]} <X size={12} />
                  </button>
                ))}
                {directions.map((d) => (
                  <button key={d} className="chip chip--button" onClick={() => toggleParam('direction', d, directions)}>
                    {d} <X size={12} />
                  </button>
                ))}
                {formats.map((f) => (
                  <button key={f} className="chip chip--button" onClick={() => toggleParam('format', f, formats)}>
                    {FORMAT_LABELS[f as WorkFormat]} <X size={12} />
                  </button>
                ))}
                {paidOnly && (
                  <button className="chip chip--button" onClick={() => update('paid', null)}>
                    С оплатой <X size={12} />
                  </button>
                )}
              </div>
            )}

            {results.length ? (
              <div className="cases-grid">
                {results.map((c) => (
                  <CaseCard
                    key={c.id}
                    item={c}
                    employer={state.users.find((u) => u.id === c.employerId)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Search size={22} />}
                title="Ничего не нашлось"
                description="Попробуйте убрать часть фильтров или поискать по другому навыку — например, SQL, Figma или Go."
                action={
                  <div className="row" style={{ justifyContent: 'center' }}>
                    <button className="btn btn--primary" onClick={resetAll}>
                      Сбросить фильтры
                    </button>
                    <Link to="/cases" className="btn btn--outline">
                      Весь каталог
                    </Link>
                  </div>
                }
              />
            )}

            <div className="card mt-32" style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
              <span className="feature__icon">
                <Filter size={18} />
              </span>
              <div style={{ flex: 1, minWidth: 220 }}>
                <div className="strong small">Не нашли подходящую задачу?</div>
                <div className="tiny muted">Расскажите, что умеете, — подберём кейс вручную.</div>
              </div>
              <a className="btn btn--outline btn--sm" href="mailto:hello@stupen.ru">
                Написать
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
