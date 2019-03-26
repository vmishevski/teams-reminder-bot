export type CronParam = number | number[] | '*';

export default function generateCronExpression(
  minute: CronParam,
  hour: CronParam,
  dayOfMonth: CronParam = '*',
  month: CronParam = '*',
  dayOfWeek: CronParam = '*'
): string {
  return `${joinIfArray(minute)} ${joinIfArray(hour)} ${joinIfArray(dayOfMonth)} ${joinIfArray(
    month
  )} ${joinIfArray(dayOfWeek)}`;
}

function joinIfArray(param: CronParam): string {
  if (Array.isArray(param)) {
    return param.join(',');
  }
  return param.toString();
}
