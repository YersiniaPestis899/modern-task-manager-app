import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string | null): string {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export function formatTime(time: string | null): string {
  if (!time) return ''
  const [hours, minutes] = time.split(':')
  const date = new Date()
  date.setHours(parseInt(hours), parseInt(minutes))
  return date.toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function formatDateTime(date: Date | string | null, time?: string | null): string {
  if (!date) return ''
  const formattedDate = formatDate(date)
  const formattedTime = time ? formatTime(time) : ''
  return formattedTime ? `${formattedDate} ${formattedTime}` : formattedDate
}

export function getRelativeTime(date: Date | string): string {
  const now = new Date()
  const targetDate = typeof date === 'string' ? new Date(date) : date
  const diffInSeconds = Math.floor((targetDate.getTime() - now.getTime()) / 1000)
  
  if (diffInSeconds < 0) {
    const absDiff = Math.abs(diffInSeconds)
    if (absDiff < 60) return '数秒前'
    if (absDiff < 3600) return `${Math.floor(absDiff / 60)}分前`
    if (absDiff < 86400) return `${Math.floor(absDiff / 3600)}時間前`
    return `${Math.floor(absDiff / 86400)}日前`
  }
  
  if (diffInSeconds < 60) return '間もなく'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}分後`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}時間後`
  return `${Math.floor(diffInSeconds / 86400)}日後`
}

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'urgent':
      return 'text-red-600 bg-red-50 border-red-200'
    case 'high':
      return 'text-orange-600 bg-orange-50 border-orange-200'
    case 'medium':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    case 'low':
      return 'text-green-600 bg-green-50 border-green-200'
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200'
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'completed':
      return 'text-green-600 bg-green-50 border-green-200'
    case 'in_progress':
      return 'text-blue-600 bg-blue-50 border-blue-200'
    case 'pending':
      return 'text-gray-600 bg-gray-50 border-gray-200'
    case 'cancelled':
      return 'text-red-600 bg-red-50 border-red-200'
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200'
  }
}

export function getPriorityIcon(priority: string): string {
  switch (priority) {
    case 'urgent':
      return '🔥'
    case 'high':
      return '⚡'
    case 'medium':
      return '⭐'
    case 'low':
      return '🌿'
    default:
      return '📝'
  }
}

export function isOverdue(dueDate: string | null, dueTime?: string | null): boolean {
  if (!dueDate) return false
  
  const now = new Date()
  const due = new Date(dueDate)
  
  if (dueTime) {
    const [hours, minutes] = dueTime.split(':')
    due.setHours(parseInt(hours), parseInt(minutes))
  } else {
    due.setHours(23, 59, 59) // End of day if no time specified
  }
  
  return due < now
}

export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}
