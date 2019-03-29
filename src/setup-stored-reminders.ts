import { ReminderStorage } from './job-storage';
import { UniversalBot, Session } from 'botbuilder';
import setupReminder from './setup-reminder';

export default async function setupStoredReminders(bot: UniversalBot): Promise<void> {
  const reminderStorage = new ReminderStorage();

  const reminders = await reminderStorage.getReminders();

  reminders.forEach(reminder => {
    setupReminder(bot, reminder.reminder, reminder.address, false);
  });
}
