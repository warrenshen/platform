import {
  addBusinessDays,
  addMonths,
  differenceInDays,
  format,
  parse,
  parseISO,
} from "date-fns";

export const DateFormatClient = "MM/dd/yyyy";
export const DateFormatServer = "yyyy-MM-dd";
export const TimeFormatClient = "hh:mm:ss a";

export function todayAsDateStringServer(): string {
  return format(new Date(), DateFormatServer);
}

export function todayAsDateStringClient(): string {
  return format(new Date(), DateFormatClient);
}

export function formatDateString(dateString: string) {
  if (!dateString) {
    return "Invalid Date";
  } else {
    try {
      return format(
        parse(dateString, DateFormatServer, new Date()),
        DateFormatClient
      );
    } catch (error) {
      console.error(
        `Could not format the date string "${dateString}", returning null. Error message: "${error}".`
      );
      return null;
    }
  }
}

export function formatDatetimeString(
  datetimeString: string,
  isTimeVisible: boolean = true
) {
  if (!datetimeString) {
    return "Invalid Datetime";
  } else {
    try {
      return format(
        parseISO(datetimeString),
        isTimeVisible
          ? `${DateFormatClient} ${TimeFormatClient}`
          : DateFormatClient
      );
    } catch (error) {
      console.error(
        `Could not format the datetime string "${datetimeString}", returning null. Error message: "${error}".`
      );
      return null;
    }
  }
}

export function addBizDays(dateString: string, days: number) {
  if (!dateString) {
    return "Invalid Date";
  }

  const date = parse(dateString, DateFormatServer, new Date());
  const result = addBusinessDays(date, days);
  return format(result, DateFormatServer);
}

export function computeEbbaApplicationExpiresAt(dateString: string): string {
  if (!dateString) {
    return "Invalid Date";
  }
  const date = parse(dateString, DateFormatServer, new Date());
  const nextMonth = addMonths(date, 1);
  nextMonth.setDate(15);
  return format(nextMonth, DateFormatServer);
}

export function withinNDaysOfNowOrBefore(
  dateString: string,
  days: number
): boolean {
  if (!dateString) {
    return false;
  }
  const date = parse(dateString, DateFormatServer, new Date());
  const now = new Date();
  // When this `date` is before `now`, differenceInDays returns a negative number
  // which will be less than `days`
  return differenceInDays(date, now) <= days;
}
