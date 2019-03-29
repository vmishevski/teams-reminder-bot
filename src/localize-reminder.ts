import { ParsedReminder } from './parsed-schedule';
import { IMessage } from 'botbuilder';

export default function localizeReminder(
  reminder: ParsedReminder,
  message: IMessage
): ParsedReminder {
  if (!reminder || !reminder.schedule) {
    return reminder;
  }

  const offsetHours = (new Date(message.localTimestamp).getTimezoneOffset() / 60) * -1;
  if (reminder.schedule.day instanceof Date) {
    reminder.schedule.day.setHours(reminder.schedule.day.getHours() + offsetHours);
  } else if (reminder.schedule.day) {
    reminder.schedule.day += offsetHours;
  }

  if (reminder.schedule.time) {
    if (reminder.schedule.time instanceof Date) {
    } else if (reminder.schedule.time.hour) {
      reminder.schedule.time.hour;
    }
  }
}
