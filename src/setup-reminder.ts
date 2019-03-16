import { ParsedReminder } from './parsed-schedule';
import { UniversalBot, Session } from 'botbuilder';
import * as scheduler from 'node-schedule';
import { format } from 'date-fns';

export default function setupReminder(
  bot: UniversalBot,
  session: Session,
  parsedReminder: ParsedReminder
): void {
  if (!parsedReminder) {
    return;
  }

  if (!parsedReminder.message || !parsedReminder.schedule) {
    return;
  }

  if (!parsedReminder.schedule.day && !parsedReminder.schedule.time) {
    return;
  }

  const { schedule, message } = parsedReminder;

  if (schedule.time instanceof Date) {
    session.send(
      `Ok, I will remind you about "${message}" at ${format(schedule.time, 'DD/MM hh:mm')}`
    );
    const job = scheduler.scheduleJob(schedule.time, () => {
      bot.loadSession(session.message.address, (err, reminderSession) => {
        reminderSession.send(`You asked me to remind you about "${message}"`);
      });
    });

    const jobs = session.userData.jobs || [];
    jobs.push(job.name);
    session.userData.jobs = jobs;
  }
}
