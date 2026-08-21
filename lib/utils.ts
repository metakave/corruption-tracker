import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date | null | undefined) {
  if (!date) return 'N/A'
  try {
    const d = new Date(date)
    if (isNaN(d.getTime())) return 'Invalid Date'
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    }) // Returns DD/MM/YY
  } catch (e) {
    return 'N/A'
  }
}

export function getNextScrapeTime(): Date {
  const now = new Date();
  const interval = 2; // hours
  const currentHour = now.getUTCHours();

  // Calculate next interval hour (0, 2, 4, ..., 22, 24)
  const nextHour = Math.floor(currentHour / interval) * interval + interval;

  const nextUpdate = new Date(now);
  nextUpdate.setUTCHours(nextHour, 0, 0, 0);

  return nextUpdate;
}


// Timezone Helpers (UTC+6 for Bangladesh)
export function toBDDateStart(date: Date) {
  const offset = 6 * 60 * 60 * 1000
  const bdDate = new Date(date.getTime() + offset)
  bdDate.setUTCHours(0, 0, 0, 0)
  return new Date(bdDate.getTime() - offset) // Convert back to UTC
}

export function toBDDateEnd(date: Date) {
  const offset = 6 * 60 * 60 * 1000
  const bdDate = new Date(date.getTime() + offset)
  bdDate.setUTCHours(23, 59, 59, 999)
  return new Date(bdDate.getTime() - offset) // Convert back to UTC
}
