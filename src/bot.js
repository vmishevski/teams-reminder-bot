'use strict';

module.exports.setup = function(app) {
  var builder = require('botbuilder');
  var teams = require('botbuilder-teams');
  var config = require('config');

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
    // Message might contain @mentions which we would like to strip off in the response
    // var text = teams.TeamsMessage.getTextWithoutMentions(session.message);

    if (count % 2 === 0) {
      session.send('Hi ' + session.message.address.user.name);
    } else {
      session.send(
        'Nothing. Still waiting for Darko to complete the business requirement so that I can start reminding people'
      );
    }
    count++;
  }).set('storage', inMemoryBotStorage);

  // Setup an endpoint on the router for the bot to listen.
  // NOTE: This endpoint cannot be changed and must be api/messages
  app.post('/api/messages', connector.listen());

  // Export the connector for any downstream integration - e.g. registering a messaging extension
  module.exports.connector = connector;
};
