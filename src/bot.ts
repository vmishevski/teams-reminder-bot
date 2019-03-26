'use strict';

import * as builder from 'botbuilder';
import * as teams from 'botbuilder-teams';
var config = require('config');
import schedule, { Job, cancelJob } from 'node-schedule';
import parseMessage from './message-parser';
import setupReminder from './setup-reminder';
import JobModel from './job-model';

if (!config.has('bot.appId')) {
  // We are running locally; fix up the location of the config directory and re-intialize config
  process.env.NODE_CONFIG_DIR = '../config';
  delete require.cache[require.resolve('config')];
  config = require('config');
}
// Create a connector to handle the conversations
export const connector = new teams.TeamsChatConnector({
  // It is a bad idea to store secrets in config files. We try to read the settings from
  // the config file (/config/default.json) OR then environment variables.
  // See node config module (https://www.npmjs.com/package/config) on how to create config files for your Node.js environment.
  appId: config.get('bot.appId'),
  appPassword: config.get('bot.appPassword'),
});

var inMemoryBotStorage = new builder.MemoryBotStorage();

// Define a simple bot with the above connector that echoes what it received
var bot = new builder.UniversalBot(connector, function(session) {
  var messageText = teams.TeamsMessage.getTextWithoutMentions(session.message);

  console.log(
    `received message on: ${session.message.timestamp}, local: ${session.message.localTimestamp}`
  );

  if (messageText === 'list') {
    const reminderJobs: JobModel[] = session.userData.jobs || [];

    if (!reminderJobs.length) {
      session.send(`I cannot find any reminders`);
      return;
    }

    const allRemindersText = reminderJobs
      .map(job => {
        return `"${job.reminder.message}" - ${JSON.stringify(job.reminder.schedule)}`;
      })
      .join('\r\n');

    session.send(`Here are your reminders:\r\n ${allRemindersText}`);
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

  setupReminder(bot, session, parsedMessage);
}).set('storage', inMemoryBotStorage);

export const setup = function(app) {
  // Setup an endpoint on the router for the bot to listen.
  // NOTE: This endpoint cannot be changed and must be api/messages
  app.post('/api/messages', connector.listen());

  // Export the connector for any downstream integration - e.g. registering a messaging extension
};
