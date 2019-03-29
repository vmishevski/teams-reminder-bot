'use strict';

import * as builder from 'botbuilder';
import * as teams from 'botbuilder-teams';
var config = require('config');
import schedule, { Job, cancelJob } from 'node-schedule';
import parseMessage from './message-parser';
import setupReminder from './setup-reminder';
import JobModel from './job-model';
import { connector } from './teams-connector';
import { ReminderStorage } from './job-storage';
import setupStoredReminders from './setup-stored-reminders';

if (!config.has('bot.appId')) {
  // We are running locally; fix up the location of the config directory and re-intialize config
  process.env.NODE_CONFIG_DIR = '../config';
  delete require.cache[require.resolve('config')];
  config = require('config');
}

var inMemoryBotStorage = new builder.MemoryBotStorage();

// Define a simple bot with the above connector that echoes what it received
var bot = new builder.UniversalBot(connector, function(session) {
  var messageText = teams.TeamsMessage.getTextWithoutMentions(session.message);

  console.log(
    `received message on: ${session.message.timestamp}, local: ${
      session.message.localTimestamp
    }\r\n`
  );

  console.log(
    `received message in channel '${session.message.address.channelId}' from user: '${
      session.message.address.user.id
    }' \r\n`
  );

  console.log(`entire message: ${JSON.stringify(session.message)}\r\n`);

  console.log(`offset ${new Date(session.message.localTimestamp).getTimezoneOffset()}\r\n`);

  if (messageText === 'list') {
    const reminderStorage = new ReminderStorage();
    reminderStorage.getReminders().then(reminders => {
      bot.loadSession(session.message.address, (err, s) => {
        if (!reminders.length) {
          s.send(`I cannot find any reminders`);
          return;
        }

        const allRemindersText = reminders
          .map(job => {
            return `"${job.reminder.message}" - ${JSON.stringify(job.reminder.schedule)}`;
          })
          .join('\r\n');

        s.send(`Here are your reminders:\r\n ${allRemindersText}`);
      });
    });
    return;
  }

  if (messageText === 'clear') {
    const jobs = session.userData.jobs as string[];
    if (jobs) {
      jobs.forEach(job => cancelJob(job));
      session.userData.jobs = [];
    }
    return;
  }

  const parsedMessage = parseMessage(messageText);

  if (!parsedMessage || !parsedMessage.message || !parsedMessage.schedule) {
    session.send(`Sorry, I did not understood that.`);
    return;
  }

  setupReminder(bot, parsedMessage, session.message.address);
}).set('storage', inMemoryBotStorage);

export const setup = function(app) {
  // Setup an endpoint on the router for the bot to listen.
  // NOTE: This endpoint cannot be changed and must be api/messages
  app.post('/api/messages', connector.listen());

  setupStoredReminders(bot);
};
