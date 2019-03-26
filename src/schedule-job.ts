import { Session, UniversalBot } from 'botbuilder';
import { ParsedReminder } from './parsed-schedule';
import { Job } from 'node-schedule';
import * as scheduler from 'node-schedule';

export default function scheduleJob(
  bot: UniversalBot,
  cron: string | Date,
  session: Session,
  reminder: ParsedReminder
): Job {
  const job = scheduler.scheduleJob(cron, () => {
    const address = { ...session.message.address };
    delete address.conversation;
    bot.loadSession(session.message.address, (err, reminderSession) => {
      if (err) {
        console.error(err);
        return;
      }
      reminderSession.send(reminder.message);
    });
  });

  return job;
}
