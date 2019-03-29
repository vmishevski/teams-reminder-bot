import { Session } from 'botbuilder';
import JobModel from './job-model';
import { MongoClient, Db, InsertOneWriteOpResult, Collection } from 'mongodb';
const uuid = require('uuid/v1');

const mongoUrl =
  'mongodb://teams-reminder-bot:Xf4QMBM54rsCnBqF59ha@ds127736.mlab.com:27736/teams-reminder';
const project = 'teams-reminder';

const client = new MongoClient(mongoUrl);
const db$: Promise<Db> = client
  .connect()
  .then(client => {
    return client.db(project);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
    return null;
  });

const reminders$: Promise<Collection<JobModel>> = db$.then(db => db.collection('reminders'));

export class ReminderStorage {
  saveReminder(job: JobModel): Promise<InsertOneWriteOpResult> {
    return reminders$.then(reminders => reminders.insertOne(job));
  }

  getReminders(): Promise<JobModel[]> {
    return reminders$.then(reminders => reminders.find().toArray());
  }
}
