import { Link } from 'react-router-dom'
import { CalendarDays, Clock, MapPin } from 'lucide-react'
import type { CaseItem, User } from '../types'
import { FORMAT_LABELS, daysLeft, formatShortDate } from '../data/dictionaries'
import { rewardText } from '../lib/helpers'
import { Avatar, TypeBadge } from './ui'

export default function CaseCard({ item, employer }: { item: CaseItem; employer?: User }) {
  const left = daysLeft(item.deadline)
  const urgent = left >= 0 && left <= 7

  return (
    <Link to={`/cases/${item.id}`} className="case-card">
      <div className="case-card__top">
        <TypeBadge type={item.type} />
        <span className="tiny muted">{FORMAT_LABELS[item.format]}</span>
      </div>

      <div>
        <h3 className="case-card__title">{item.title}</h3>
        <p className="case-card__summary" style={{ marginTop: 8 }}>
          {item.summary}
        </p>
      </div>

      <div className="case-card__meta">
        <span>
          <MapPin size={13} /> {item.city}
        </span>
        <span>
          <Clock size={13} /> {item.duration}
        </span>
        <span style={urgent ? { color: 'var(--accent)' } : undefined}>
          <CalendarDays size={13} /> до {formatShortDate(item.deadline)}
        </span>
      </div>

      <div className="chips">
        {item.skills.slice(0, 3).map((s) => (
          <span key={s} className="chip" style={{ fontSize: '0.74rem', padding: '3px 9px' }}>
            {s}
          </span>
        ))}
        {item.skills.length > 3 && (
          <span className="chip" style={{ fontSize: '0.74rem', padding: '3px 9px' }}>
            +{item.skills.length - 3}
          </span>
        )}
      </div>

      <div className="case-card__foot">
        <div className="case-card__company">
          <Avatar
            name={employer?.company ?? employer?.name ?? 'Компания'}
            color={employer?.avatarColor}
            size="sm"
          />
          <span className="case-card__company-name">{employer?.company ?? 'Компания'}</span>
        </div>
        <span className={item.reward.type === 'none' ? 'reward reward--muted' : 'reward'}>
          {rewardText(item.reward)}
        </span>
      </div>
    </Link>
  )
}
