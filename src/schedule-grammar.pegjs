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
  = '"' msg:([a-z, ' '])* '"' { return msg.join(''); }
  
schedule
  = recurringSchedule
  / day:day? _? time:time? { return {time, day} }
  
recurringSchedule
  = recurrence:recurrence _ day:day? _? time:time? { return {recurrence, time, day} }
  
recurrence
  = "daily"
  / "weekly"
  / "monthly"
  / "yearly"

time
  = "at " hour:integer ":"? min:integer? { return {hour,min} }
  / "in " digit:integer _ "seconds" { return addSeconds(new Date(), digit); }
  / "in " digit:integer _ "minutes" { return addMinutes(new Date(), digit); }
  
day
  = "on " day:integer "th"? { return day; }
  / "today" { return new Date(); }
  / "Today" { return new Date(); }
  / "Tommorow" { var d = new Date(); d.setDate(d.getDate() + 1); return d; }
  / "tommorow" { var d = new Date(); d.setDate(d.getDate() + 1); return d; }

integer
  = digits:[0-9]+ { return parseInt(digits.join(''), 10) }

_ "whitespace"
  = [ \t\r\n]*