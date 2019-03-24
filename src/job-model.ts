import { IAddress } from 'botbuilder';
import { ParsedReminder } from './parsed-schedule';

export default interface JobModel {
  name: string;
  address: IAddress;
  reminder: ParsedReminder;
}
