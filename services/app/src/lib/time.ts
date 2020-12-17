import { format, isValid, parse } from "date-fns";

/**
 * Return the current time as a timestamp with time-zone (timestamptz)
 * See https://www.postgresql.org/docs/9.1/datatype-datetime.html
 */
export function timestamptzNow() {
  return format(Date.now(), "yyyy-MM-dd'T'HH:mm:ss.SSSSSSX");
}

export function dateFromTimestamptzNow(dateString: string) {
  let date = null;
  date = parse(dateString, "yyyy-MM-dd'T'HH:mm:ss.SSSSSSxxx", new Date());
  if (!isValid(date)) {
    date = parse(dateString, "yyyy-MM-dd'T'HH:mm:ssxxx", new Date());
  }
  return date;
}

export function timestamptzNowFromDate(date: Date) {
  return format(date, "yyyy-MM-dd'T'HH:mm:ss.SSSSSSX");
}

export function calendarDateTimestamp(dateString: string) {
  let result = "";
  try {
    const parsedDate = dateFromTimestamptzNow(dateString);
    result = parsedDate ? format(parsedDate, "LLLL do, yyyy") : "";
  } catch (error) {
    result = "";
  }
  return result;
}
