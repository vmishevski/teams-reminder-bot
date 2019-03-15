'use strict';

module.exports.setup = function(app) {
  var builder = require('botbuilder');
  var teams = require('botbuilder-teams');
  var config = require('config');
  const schedule = require('node-schedule');
  const parseMessage = require('./message-parser');

  const { addSeconds, getDate, startOfTomorrow } = require('date-fns');

  if (!config.has('bot.appId')) {
    // We are running locally; fix up the location of the config directory and re-intialize config
    process.env.NODE_CONFIG_DIR = '../config';
    delete require.cache[require.resolve('config')];
    config = require('config');
  }
  // Create a connector to handle the conversations
  var connector = new teams.TeamsChatConnector({
    // It is a bad idea to store secrets in config files. We try to read the settings from
    // the config file (/config/default.json) OR then environment variables.
    // See node config module (https://www.npmjs.com/package/config) on how to create config files for your Node.js environment.
    appId: config.get('bot.appId'),
    appPassword: config.get('bot.appPassword'),
  });

  var inMemoryBotStorage = new builder.MemoryBotStorage();

  var count = 0;
  // Define a simple bot with the above connector that echoes what it received
  var bot = new builder.UniversalBot(connector, function(session) {
    // function isValidReminder() {
    //   teams.TeamsMessage.getTextWithoutMentions(session.message);
    //   return session.message;
    // }

    // Message might contain @mentions which we would like to strip off in the response
    // var text = teams.TeamsMessage.getTextWithoutMentions(session.message);

    // console.log(session.userData);
    // console.log(session.message.address);
    console.log(session.message);
    console.log(teams.TeamsMessage.getTextWithoutMentions(session.message));

    var messageText = teams.TeamsMessage.getTextWithoutMentions(session.message);

    // @Remind {text} every (day|month|year) {at XX}

    if (messageText.split('every').length > 1) {
      var reminderText = messageText[0];
      var cronExpression = '';

      var recurenceText = messageText[1];
      var hour = 9;
      var minute = 0;

      if (recurenceText.indexOf('at ') > -1) {
        var timeText = recurenceText.split('at ')[1];
        hour = parseInt(timeText.split(':')[0]) || 9;
        minute = parseInt(timeText.split(':')[1]) || 0;
      }

      if (recurenceText.startsWith('day')) {
        cronExpression = getCronExpression(minute, hour);
      } else if (recurenceText.startsWith('month')) {
      }

      if (
        recurenceText.startsWith('day') ||
        recurenceText.startsWith('month') ||
        recurenceText.startsWith('year') ||
        recurenceText.startsWith('weekday')
      ) {
      }
    }

    function getCronExpression(minute, hour, dayOfMonth, month, dayOfWeek) {
      return `${minute ||
        '*'} ${hour || '*'} ${dayOfMonth || '*'} ${month || '*'} ${dayOfWeek || '*'}`;
    }

    /**
     *
     * @param {string} str
     */
    function getDay(str) {
      if (!str) {
        return null;
      }

      str = str.toLowerCase();

      if (str.indexOf('tommorow') > -1) {
        return getDate(new Date());
      }

      if (str.indexOf('tommorow')) {
        return getDate(startOfTomorrow());
      }

      if (str)
        if (str.indexOf(' on ') === -1) {
          return null;
        }

      var maybeDayStr = str.split(' on ')[1];
      var dayStr = '';
      if (typeof parseInt(maybeDayStr[0]) === 'number') {
        dayStr += maybeDayStr[0];
      }
      if (typeof parseInt(maybeDayStr[1]) === 'number') {
        dayStr += maybeDayStr[1];
      }

      var day = parseInt(dayStr);

      if (day > 31) {
        return null;
      }

      return day;
    }

    /**
     *
     * @param {string} str
     */
    function getTimeOfDay(str) {
      if (!str) {
        return null;
      }

      str = str.toLowerCase();

      if (str.indexOf(' at ') === -1) {
        return null;
      }

      str = str
        .split(' at ')[1]
        .trim()
        .slice(0, 4);

      /**
       *
       * @param {string} text
       * @returns {number} number
       */
      function getIntegerWithTwoLettersMax(text) {
        var textSize = 1;

        if (typeof parseInt(text[1]) === 'number') {
          textSize++;
        }

        var integer = parseInt(text.slice(0, textSize));
        if (typeof integer !== 'number') {
          return null;
        }

        return integer;
      }

      var hourText = str.split(':')[0];
      var hour = getIntegerWithTwoLettersMax(hourText);

      if (typeof hour !== 'number') {
        return null;
      }

      var minuteText = str.split(':')[1];
      var minute = getIntegerWithTwoLettersMax(minuteText) || 0;

      return { hour, minute };
    }

    if (count % 2 === 0) {
      session.send('Hi ' + session.message.address.user.name);
    } else {
      session.send(
        'Nothing. Still waiting for Darko to complete the business requirement so that I can start reminding people'
      );
    }
    count++;

    const job = schedule.scheduleJob(addSeconds(new Date(), 5), () => {
      // bot.beginDialog(session.message.address, '1', err => {
      //   console.log('dialog done', err);
      // });
      bot.loadSession(session.message.address, (err, s) => {
        if (err) {
          console.error(err);
          return;
        }
        const parsedMessage = parseMessage(messageText);
        console.log(parsedMessage);
        s.send('Hi there!');
      });
    });
  }).set('storage', inMemoryBotStorage);

  // Setup an endpoint on the router for the bot to listen.
  // NOTE: This endpoint cannot be changed and must be api/messages
  app.post('/api/messages', connector.listen());

  // Export the connector for any downstream integration - e.g. registering a messaging extension
  module.exports.connector = connector;
};
