import { ParsedReminder, RecurrenceType } from './parsed-schedule';
import { UniversalBot, Session } from 'botbuilder';
import * as scheduler from 'node-schedule';
import { format, isWeekend } from 'date-fns';
import generateCronExpression from './generate-cron-expression';
import storeJob from './job-storage';
import mapToJobModel from './map-to-job-model';
import parseReminderTime from './parse-reminder-time';
import parseReminderDate from './parse-reminder-date';
import scheduleJob from './schedule-job';
import weekDayToString from './weekday-to-string';

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

  if (!schedule.recurrence) {
    const { hour, minute } = parseReminderTime(parsedReminder);
  } else if (schedule.time instanceof Date) {
    session.send(
      `Ok, I will remind you about "${message}" at ${format(schedule.time, 'DD/MM hh:mm')}`
    );
    const job = scheduleJob(bot, schedule.time, session, parsedReminder);
    storeJob(mapToJobModel(job, parsedReminder, session), session);
  } else if (schedule.recurrence === RecurrenceType.daily) {
    const { hour, minute } = parseReminderTime(parsedReminder);
    const cron = generateCronExpression(minute, hour);
    const job = scheduleJob(bot, cron, session, parsedReminder);
    storeJob(mapToJobModel(job, parsedReminder, session), session);
    session.send(
      `Ok, I will remind you daily about '${parsedReminder.message}' at ${hour}:${minute}`
    );
  } else if (schedule.recurrence === RecurrenceType.weekly) {
    const { hour, minute } = parseReminderTime(parsedReminder);
    const cron = generateCronExpression(minute, hour, '*', '*', schedule.weekday);

    const job = scheduleJob(bot, cron, session, parsedReminder);
    storeJob(mapToJobModel(job, parsedReminder, session), session);
    session.send(
      `Ok, I will remind you daily about '${parsedReminder.message}' every ${weekDayToString(
        parsedReminder.schedule.weekday
      )} at ${hour}:${minute}`
    );
  } else if (schedule.recurrence === RecurrenceType.monthly) {
    const { hour, minute } = parseReminderTime(parsedReminder);
    let dayOfMonth = parseReminderDate(parsedReminder);
    const cron = generateCronExpression(minute, hour, dayOfMonth);
    const job = scheduleJob(bot, cron, session, parsedReminder);
    storeJob(mapToJobModel(job, parsedReminder, session), session);
    session.send(
      `Ok, I will remind you every month on [${dayOfMonth}] at ${hour}:${minute} about '${
        parsedReminder.message
      }'`
    );
  }
}