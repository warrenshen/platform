import {
  addBusinessDays,
  addDays,
  addMonths,
  differenceInDays,
  format,
  getYear,
  isEqual,
  parse,
  parseISO,
} from "date-fns";
import { getBankHolidays, Holiday } from "date-fns-holiday-us";

export const MonthFormatClient = "MM/yyyy";
export const DateFormatClient = "MM/dd/yyyy";
export const DateFormatServer = "yyyy-MM-dd";
export const TimeFormatClient = "hh:mm:ss a";

export function todayAsDateStringServer() {
  return format(new Date(), DateFormatServer);
}

export function previousBizDayAsDateStringServer() {
  return subtractBizDays(todayAsDateStringServer(), 1);
}

export function todayAsDateStringClient() {
  return format(new Date(), DateFormatClient);
}

export function todayMinusXDaysDateStringServer(xDays: number) {
  return format(addDays(new Date(), -1 * xDays), DateFormatServer);
}

export function lastThreeMonthsCertificationDates() {
  return [
    todayAsDateStringServer(),
    todayAsDateStringServer(),
    todayAsDateStringServer(),
  ];
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

export function formatDateStringAsMonth(dateString: string) {
  if (!dateString) {
    return "Invalid Date";
  } else {
    try {
      return format(
        parse(dateString, DateFormatServer, new Date()),
        MonthFormatClient
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

function isBankHoliday(date: Date) {
  const holidays = getBankHolidays(getYear(date));
  return (
    Object.keys(holidays).filter((holidayName) => {
      return isEqual(date, holidays[holidayName as Holiday].date);
    }).length > 0
  );
}

export function addBizDays(dateString: string, days: number) {
  if (!dateString) {
    return "Invalid Date";
  }
  // Add days to given date, skipping non-business days.
  // Non-business days are weekends and bank holidays.
  // Ex. 05/28/21 + 2 business days = 06/02/21, since
  // 05/29/21 and 05/30/21 are weekend days and 05/31/21 is a holiday.
  const inputDate = parse(dateString, DateFormatServer, new Date());
  let resultDate = inputDate;
  while (days > 0) {
    resultDate = addBusinessDays(resultDate, 1);
    while (isBankHoliday(resultDate)) {
      resultDate = addBusinessDays(resultDate, 1);
    }
    days -= 1;
  }
  return format(resultDate, DateFormatServer);
}

export function subtractBizDays(dateString: string, days: number) {
  if (!dateString) {
    return "Invalid Date";
  }
  // Subtract days from given date, skipping non-business days.
  // Non-business days are weekends and bank holidays.
  const inputDate = parse(dateString, DateFormatServer, new Date());
  let resultDate = inputDate;
  while (days > 0) {
    resultDate = addBusinessDays(resultDate, -1);
    while (isBankHoliday(resultDate)) {
      resultDate = addBusinessDays(resultDate, -1);
    }
    days -= 1;
  }
  return format(resultDate, DateFormatServer);
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
