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
  const targetTimes = [
    new Date(now).setUTCHours(2, 0, 0, 0),   // 02:00 UTC (08:00 AM BD)
    new Date(now).setUTCHours(7, 0, 0, 0),   // 07:00 UTC (01:00 PM BD)
    new Date(now).setUTCHours(17, 0, 0, 0),  // 17:00 UTC (11:00 PM BD)
    new Date(now).setUTCHours(26, 0, 0, 0),  // 02:00 UTC tomorrow
  ];

  // Find the first target time that is in the future
  for (const time of targetTimes) {
    if (time > now.getTime()) {
      return new Date(time);
    }
  }
  return new Date(targetTimes[3]); // Fallback (tomorrow morning)
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
