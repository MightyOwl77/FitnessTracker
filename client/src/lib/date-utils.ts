import { format, addDays, subDays, isSameDay } from "date-fns";

// Format date for display
export function formatDate(date: Date): string {
  return format(date, "MMM d, yyyy");
}

// Format date for API requests
export function formatApiDate(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

// Get next day
export function getNextDay(date: Date): Date {
  return addDays(date, 1);
}

// Get previous day
export function getPreviousDay(date: Date): Date {
  return subDays(date, 1);
}

// Check if two dates are the same
export function isSameDate(date1: Date, date2: Date): boolean {
  return isSameDay(date1, date2);
}

// Get a future date based on weeks from now
export function getDateAfterWeeks(weeks: number): Date {
  return addDays(new Date(), weeks * 7);
}

// Format the future date as a goal date
export function formatGoalDate(weeks: number): string {
  const futureDate = getDateAfterWeeks(weeks);
  return format(futureDate, "MMM d, yyyy");
}

// Get array of dates for the last n days
export function getLastNDays(n: number): Date[] {
  const dates = [];
  const today = new Date();
  
  for (let i = n - 1; i >= 0; i--) {
    dates.push(subDays(today, i));
  }
  
  return dates;
}

// Get array of formatted dates for the last n days
export function getLastNDayLabels(n: number): string[] {
  return getLastNDays(n).map(date => format(date, "MMM d"));
}
