import { format, formatDistanceToNow, differenceInDays, startOfWeek } from 'date-fns'

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export function formatDate(date: Date | string): string {
  return format(new Date(date), 'MMM d, yyyy')
}

export function formatTime(date: Date | string): string {
  return format(new Date(date), 'h:mm a')
}

export function formatRelativeTime(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function getDaysUntil(date: Date | string): number {
  return differenceInDays(new Date(date), new Date())
}

export function getWeekStart(date: Date = new Date()): Date {
  return startOfWeek(date, { weekStartsOn: 1 }) // Monday
}

export function getSubjectColor(index: number): string {
  const colors = [
    '#8b5cf6', // purple
    '#3b82f6', // blue
    '#ec4899', // pink
    '#10b981', // green
    '#f59e0b', // amber
    '#ef4444', // red
    '#06b6d4', // cyan
    '#8b5cf6', // purple (repeat)
  ]
  return colors[index % colors.length]
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  if (hours === 0) return `${mins}m`
  if (mins === 0) return `${hours}h`
  return `${hours}h ${mins}m`
}

export function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

export function calculateBlockDuration(startTime: string, endTime: string): number {
  const start = parseTimeToMinutes(startTime)
  const end = parseTimeToMinutes(endTime)
  return end - start
}
