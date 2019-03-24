import { Job } from 'node-schedule';
import { ParsedReminder } from './parsed-schedule';
import { Session } from 'botbuilder';
import JobModel from './job-model';

export default function mapToJobModel(
  job: Job,
  reminder: ParsedReminder,
  session: Session
): JobModel {
  return {
    name: job.name,
    reminder: reminder,
    address: session.message.address,
  };
}
