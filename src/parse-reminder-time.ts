import { ParsedReminder } from './parsed-schedule';

export default function parseReminderTime(
  reminder: ParsedReminder
): { hour: number; minute: number } {
  let hour = 9;
  let minute = 0;
  const schedule = reminder.schedule;

  if (schedule.time instanceof Date) {
    hour = schedule.time.getHours();
    minute = schedule.time.getMinutes();
  } else if (schedule.time) {
    hour = schedule.time.hour || 9;
    minute = schedule.time.min || 0;
  }

  return { hour, minute };
}
