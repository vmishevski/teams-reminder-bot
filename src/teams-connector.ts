var config = require('config');
import * as teams from 'botbuilder-teams';

// Create a connector to handle the conversations
export const connector = new teams.TeamsChatConnector({
  // It is a bad idea to store secrets in config files. We try to read the settings from
  // the config file (/config/default.json) OR then environment variables.
  // See node config module (https://www.npmjs.com/package/config) on how to create config files for your Node.js environment.
  appId: config.get('bot.appId'),
  appPassword: config.get('bot.appPassword'),
});
