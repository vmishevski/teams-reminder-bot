const peg = require('pegjs');
const fs = require('fs');
const path = require('path');

const grammar = fs.readFileSync(path.resolve(__dirname, './schedule-grammar.pegjs'));
console.log('grammar', grammar);
const parser = peg.generate(grammar.toString());

/**
 *
 * @param {string} message
 */
function parseMessage(message) {
  try {
    return parser.parse(message);
  } catch (err) {
    console.info('invalid schedule message', message, err);
  }
}

module.exports = parseMessage;
