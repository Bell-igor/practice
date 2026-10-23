import {
  BarChart3,
  Clapperboard,
  Code2,
  Cog,
  Landmark,
  Megaphone,
  Palette,
  Sparkles,
  Users,
  type LucideIcon,
} from 'lucide-react'

const ICONS: Record<string, LucideIcon> = {
  'IT и разработка': Code2,
  'Аналитика данных': BarChart3,
  'Дизайн и UX': Palette,
  Маркетинг: Megaphone,
  Финансы: Landmark,
  Инженерия: Cog,
  'Медиа и контент': Clapperboard,
  'HR и люди': Users,
}

export function DirectionIcon({ direction, size = 18 }: { direction: string; size?: number }) {
  const Icon = ICONS[direction] ?? Sparkles
  return <Icon size={size} />
}
