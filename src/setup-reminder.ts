import { ParsedReminder, RecurrenceType } from './parsed-schedule';
import { UniversalBot, IAddress } from 'botbuilder';
import { format } from 'date-fns';
import generateCronExpression from './generate-cron-expression';
import mapToJobModel from './map-to-job-model';
import parseReminderTime from './parse-reminder-time';
import parseReminderDate from './parse-reminder-date';
import scheduleJob from './schedule-job';
import weekDayToString from './weekday-to-string';
import { ReminderStorage } from './job-storage';

export default function setupReminder(
  bot: UniversalBot,
  parsedReminder: ParsedReminder,
  address: IAddress,
  sendConfirmReply = true
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
  const reminderStorage = new ReminderStorage();

  if (schedule.time instanceof Date) {
    confirmReminder(
      `Ok, I will remind you about "${message}" at ${format(schedule.time, 'DD/MM hh:mm')}`
    );

    const job = mapToJobModel(parsedReminder, address);
    scheduleJob(bot, schedule.time, job, address);
    if (sendConfirmReply) {
      reminderStorage.saveReminder(job);
    }
  } else if (schedule.recurrence === RecurrenceType.daily) {
    const { hour, minute } = parseReminderTime(parsedReminder);
    const cron = generateCronExpression(minute, hour);
    const job = mapToJobModel(parsedReminder, address);
    scheduleJob(bot, cron, job, address);
    if (sendConfirmReply) {
      reminderStorage.saveReminder(job);
    }
    confirmReminder(
      `Ok, I will remind you daily about '${parsedReminder.message}' at ${timeDisplay(
        hour,
        minute
      )}`
    );
  } else if (schedule.recurrence === RecurrenceType.weekly) {
    const { hour, minute } = parseReminderTime(parsedReminder);
    const cron = generateCronExpression(minute, hour, '*', '*', schedule.weekday);

    const job = mapToJobModel(parsedReminder, address);
    scheduleJob(bot, cron, job, address);
    if (sendConfirmReply) {
      reminderStorage.saveReminder(job);
    }
    confirmReminder(
      `Ok, I will remind you daily about '${parsedReminder.message}' every ${weekDayToString(
        parsedReminder.schedule.weekday
      )} at ${timeDisplay(hour, minute)}`
    );
  } else if (schedule.recurrence === RecurrenceType.monthly) {
    const { hour, minute } = parseReminderTime(parsedReminder);
    let dayOfMonth = parseReminderDate(parsedReminder);
    const cron = generateCronExpression(minute, hour, dayOfMonth);
    const job = mapToJobModel(parsedReminder, address);
    scheduleJob(bot, cron, job, address);
    if (sendConfirmReply) {
      reminderStorage.saveReminder(job);
    }
    confirmReminder(
      `Ok, I will remind you every month on [${dayOfMonth}] at ${timeDisplay(
        hour,
        minute
      )} about '${parsedReminder.message}'`
    );
  } else if (schedule.recurrence === RecurrenceType.weekday) {
    const { hour, minute } = parseReminderTime(parsedReminder);
    const cron = generateCronExpression(minute, hour, '*', '*', [1, 2, 3, 4, 5]);
    const job = mapToJobModel(parsedReminder, address);
    scheduleJob(bot, cron, job, address);

    if (sendConfirmReply) {
      reminderStorage.saveReminder(job);
    }
    confirmReminder(
      `Ok, I will remind you every weekday at ${timeDisplay(hour, minute)} about '${
        parsedReminder.message
      }'`
    );
  } else {
    confirmReminder(
      `Sorry I am missing code to satisfy that wish. Accepting PR's at https://github.com/vmishevski/teams-reminder-bot`
    );
  }

  function confirmReminder(message: string) {
    if (sendConfirmReply) {
      bot.loadSession(address, (err, session) => {
        if (err) {
          console.error(err);
        }
        session.send(message);
      });
    }
  }
}

function timeDisplay(hour: number, minute: number): string {
  return `${padZero(hour)}:${padZero(minute)}`;
}

function padZero(n: number): string {
  if (n < 10) {
    return '0' + n;
  }
  return n.toString();
}
