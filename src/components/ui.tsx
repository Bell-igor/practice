import { useEffect, type ReactNode } from 'react'
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react'
import type { CaseType, User } from '../types'
import { TYPE_LABELS } from '../data/dictionaries'
import { useApp } from '../store/AppStore'

export function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function Avatar({
  name,
  color,
  size = 'md',
}: {
  name: string
  color?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}) {
  return (
    <div
      className={`avatar${size === 'md' ? '' : ` avatar--${size}`}`}
      style={{ background: color ?? 'var(--brand)' }}
      aria-hidden="true"
    >
      {initials(name)}
    </div>
  )
}

export function CompanyAvatar({ user, size }: { user: User; size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  return <Avatar name={user.company ?? user.name} color={user.avatarColor} size={size} />
}

export function TypeBadge({ type }: { type: CaseType }) {
  return <span className={`badge badge--${type}`}>{TYPE_LABELS[type]}</span>
}

export function Modal({
  open,
  title,
  children,
  onClose,
  wide,
}: {
  open: boolean
  title: string
  children: ReactNode
  onClose: () => void
  wide?: boolean
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="overlay"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className={`modal${wide ? ' modal--wide' : ''}`}>
        <div className="modal__head">
          <h3 className="modal__title">{title}</h3>
          <button className="modal__close" onClick={onClose} aria-label="Закрыть">
            <X size={17} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function Toaster() {
  const { toasts, dismissToast } = useApp()

  return (
    <div className="toasts" aria-live="polite">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast toast--${t.tone}`}
          onClick={() => dismissToast(t.id)}
          role="status"
        >
          {t.tone === 'success' && <CheckCircle2 />}
          {t.tone === 'error' && <AlertCircle />}
          {t.tone === 'info' && <Info />}
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  )
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div className="empty">
      <div className="empty__icon">{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  )
}

export function Field({
  label,
  required,
  hint,
  error,
  children,
  className,
}: {
  label: string
  required?: boolean
  hint?: string
  error?: string
  children: ReactNode
  className?: string
}) {
  return (
    <label className={`field ${className ?? ''}`}>
      <span className="label">
        {label} {required && <span>*</span>}
      </span>
      {children}
      {hint && !error && <span className="field__hint">{hint}</span>}
      {error && <span className="field__error">{error}</span>}
    </label>
  )
}

export function SectionHead({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow?: string
  title: string
  subtitle?: string
  action?: ReactNode
}) {
  return (
    <div className="section-head">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

export function Stat({ value, label }: { value: ReactNode; label: string }) {
  return (
    <div className="stat">
      <div className="stat__value">{value}</div>
      <div className="stat__label">{label}</div>
    </div>
  )
}
