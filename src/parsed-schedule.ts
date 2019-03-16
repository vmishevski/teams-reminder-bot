export enum RecurrenceType {
  daily = 'daily',
  weekly = 'weekly',
  monthly = 'monthly',
  yearly = 'yearly',
}

export interface ParsedReminder {
  message: string;
  schedule: {
    time: { hour: number; min?: number } | Date;
    day: number | Date;
    recurrence: RecurrenceType;
  };
}
