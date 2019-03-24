import { Session } from 'botbuilder';
import JobModel from './job-model';

export default function storeJob(job: JobModel, session: Session) {
  const allJobs = session.userData.jobs || [];
  allJobs.push(job);
  session.userData.jobs = allJobs;
}
