import type {
  ApplicationStatus,
  CaseType,
  RewardType,
  WorkFormat,
} from '../types'

export const DIRECTIONS = [
  'IT и разработка',
  'Аналитика данных',
  'Дизайн и UX',
  'Маркетинг',
  'Финансы',
  'Инженерия',
  'Медиа и контент',
  'HR и люди',
] as const

export const TYPE_LABELS: Record<CaseType, string> = {
  internship: 'Стажировка',
  practice: 'Практика',
  coursework: 'Курсовая',
  diploma: 'Диплом',
  project: 'Проект',
}

export const TYPE_DESCRIPTIONS: Record<CaseType, string> = {
  internship: 'Работа в команде компании на 1–6 месяцев',
  practice: 'Задача на время учебной практики',
  coursework: 'Готовая тема курсовой с реальными данными',
  diploma: 'Тема ВКР с запросом от бизнеса',
  project: 'Разовая задача с оплатой за результат',
}

export const FORMAT_LABELS: Record<WorkFormat, string> = {
  remote: 'Удалённо',
  office: 'В офисе',
  hybrid: 'Гибрид',
}

export const REWARD_LABELS: Record<RewardType, string> = {
  money: 'Денежное вознаграждение',
  offer: 'Оффер / стажировка',
  gift: 'Техника и подарки',
  none: 'Без оплаты',
}

export const APPLICATION_LABELS: Record<ApplicationStatus, string> = {
  pending: 'Отправлен',
  review: 'На рассмотрении',
  accepted: 'Принят',
  rejected: 'Отказ',
}

export const APPLICATION_TONE: Record<ApplicationStatus, string> = {
  pending: 'neutral',
  review: 'info',
  accepted: 'success',
  rejected: 'danger',
}

export const COMPANY_SIZES = ['до 50 человек', '50–200 человек', '200–1000 человек', '1000+ человек']

export const STUDY_YEARS = ['1 курс', '2 курс', '3 курс', '4 курс', '5 курс', 'Магистратура', 'Выпускник']

export function formatMoney(amount?: number): string {
  if (!amount) return '—'
  return new Intl.NumberFormat('ru-RU').format(amount) + ' ₽'
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}

export function daysLeft(iso: string): number {
  const ms = new Date(iso).getTime() - Date.now()
  return Math.ceil(ms / 86_400_000)
}

export function plural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return one
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few
  return many
}
