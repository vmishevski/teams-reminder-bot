import { ParsedReminder } from './parsed-schedule';
import { IAddress } from 'botbuilder';
import JobModel from './job-model';
const uuid = require('uuid/v1');

export default function mapToJobModel(reminder: ParsedReminder, address: IAddress): JobModel {
  return {
    name: uuid(),
    reminder: reminder,
    address: address,
  };
}
