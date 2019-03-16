import { ParsedReminder } from './parsed-schedule';

import peg from 'pegjs';
import fs from 'fs';
import path from 'path';

const grammar = fs.readFileSync(path.resolve(__dirname, './schedule-grammar.pegjs'));
console.log('grammar', grammar);
const parser = peg.generate(grammar.toString());

/**
 *
 * @param {string} message
 */
export default function parseMessage(message: string): ParsedReminder {
  try {
    return parser.parse(message);
  } catch (err) {
    console.info('invalid schedule message', message, err);
  }
}
