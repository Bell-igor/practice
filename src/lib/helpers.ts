import type { Reward } from '../types'
import { formatMoney } from '../data/dictionaries'

export function rewardText(reward: Reward): string {
  switch (reward.type) {
    case 'money':
      return reward.amount ? formatMoney(reward.amount) : 'Оплата по договорённости'
    case 'offer':
      return 'Оффер по итогам'
    case 'gift':
      return 'Техника и подарки'
    default:
      return 'Без оплаты'
  }
}

export function isPaid(reward: Reward): boolean {
  return reward.type === 'money' || reward.type === 'gift'
}

export function rewardShort(reward: Reward): string {
  if (reward.type === 'money' && reward.amount) return formatMoney(reward.amount)
  if (reward.type === 'offer') return 'оффер'
  if (reward.type === 'gift') return 'подарки'
  return 'без оплаты'
}

export function readTime(text: string): number {
  return Math.max(1, Math.round(text.split(/\s+/).length / 180))
}
