import { UniversalBot, Message, IAddress } from 'botbuilder';
import * as scheduler from 'node-schedule';
import * as teams from 'botbuilder-teams';
import JobModel from './job-model';

teams.TeamsMessage;
export default function scheduleJob(
  bot: UniversalBot,
  cron: string | Date,
  job: JobModel,
  address: IAddress
): void {
  scheduler.scheduleJob(job.name, cron, () => {
    bot.loadSession(address, (err, reminderSession) => {
      if (err) {
        console.error(err);
        return;
      }

      const message = new Message(reminderSession).address(address).text(job.reminder.message);

      reminderSession.send(message);
    });
  });
}
