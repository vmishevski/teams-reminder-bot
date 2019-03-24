export default function generateCronExpression(
  minute: number | '*',
  hour: number | '*',
  dayOfMonth: number | '*' = '*',
  month: number | '*' = '*',
  dayOfWeek: number | '*' = '*'
): string {
  return `${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`;
}
