{
  function addDays(date, days) {
  	date.setDate(date.getDate() + days); 
    return date;
  }
  
  function addHours(date, hours) {
  	date.setHours(date.getHours() + hours);
    return date;
  }
  
  function addMinutes(date, minutes) {
  	date.setMinutes(date.getMinutes() + minutes);
    return date;
  }
  
  function addSeconds(date, seconds) {
  	date.setSeconds(date.getSeconds() + seconds);
    return date;
  }
}

reminder
  = message:message _ schedule:schedule { return {message, schedule}; }
  
message
  = '"' msg:([^"])* '"' { return msg.join(''); }
  
schedule
  = recurringSchedule
  / _ day:day? _ time:time? { return {time, day} }
  / month:month _  day:integer ("th"? "rd"?)? _ time:time?
  
recurringSchedule
  = daily _ time:time { return { recurrence: "daily", time }; }
  / weekly _ "on" _ weekday:weekday _ time:time? { return { recurrence: "weekly", weekday, time }; }
  / monthly _ day:day _ time:time? { return { recurrence: "monthly", day, time }; }
  / monthly _ today:today { return { recurrence: "monthly", day: today.getDate() }; }
  / everyWeekday _ time:time? { return { recurrence: "weekday", time }; }

weekly
  = "weekly"
  / "every week"

monthly
  = "monthly"
  / "every month"
  / "each month"

daily
  = "daily"
  / "every day"
  / "each day"

everyWeekday
  = "every" _ "weekday"
  / "each" _ "weekday"
  / "weekday"

time
  = "at " hour:integer ":"? min:integer? { return {hour,min} }
  / "in " digit:integer _ "seconds" { return addSeconds(new Date(), digit); }
  / "in " digit:integer _ "minutes" { return addMinutes(new Date(), digit); }
  
day
  = "on " day:integer ("th"? "rd"?)? { return day; }
  / today
  / tommorow

today
  = "today" { return new Date(); }
  / "Today" { return new Date(); }

tommorow
  = "Tommorow" { var d = new Date(); d.setDate(d.getDate() + 1); return d; }
  / "tommorow" { var d = new Date(); d.setDate(d.getDate() + 1); return d; }

weekday
  = "Monday" { return 1; }
  / "Tuesday" { return 2; }
  / "Wednesday" { return 3; }
  / "Thursday" { return 4; }
  / "Friday" { return 5; }
  / "Saturday" { return 6; }
  / "Sunday" { return 0; }
  
month
  = "January" { return 0; }
  / "February" { return 1; }
  / "March" { return 2; }
  / "April" { return 3; }
  / "May" { return 4; }
  / "June" { return 5; }
  / "July" { return 6; }
  / "August" { return 7; }
  / "September" { return 8; }
  / "October" { return 9; }
  / "November" { return 10; }
  / "December" { return 11; }

integer
  = digits:[0-9]+ { return parseInt(digits.join(''), 10) }

_ "whitespace"
  = [ \t\r\n]*