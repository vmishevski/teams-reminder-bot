import { ParsedReminder } from './parsed-schedule';

export default function parseReminderDate(reminder: ParsedReminder): number {
  const schedule = reminder.schedule;
  if (schedule.day instanceof Date) {
    return schedule.day.getDate();
  }
  return schedule.day || 1;
}
