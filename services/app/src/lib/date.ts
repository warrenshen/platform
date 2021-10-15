import {
  addBusinessDays,
  addDays,
  addMonths,
  differenceInDays,
  format,
  getYear,
  lastDayOfMonth,
  parse,
  parseISO,
} from "date-fns";
import { addYearToBankHolidays, bankHolidays } from "lib/holidays";
import { range } from "lodash";

export const DateFormatClient = "MM/dd/yyyy";
export const DateFormatClientMonthDayOnly = "MM/dd";
export const DateFormatClientYearOnly = "yyyy";
export const MonthFormatClient = "MMMM yyyy (MM/yyyy)";
export const DateFormatServer = "yyyy-MM-dd";
export const TimeFormatClient = "hh:mm:ss a";

function dateAsDateStringServer(date: Date) {
  return format(date, DateFormatServer);
}

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

export function previousXMonthsCertificationDates(xMonths: number) {
  const today = new Date();
  return range(-1, -xMonths - 1).map((monthOffset) =>
    dateAsDateStringServer(lastDayOfMonth(addMonths(today, monthOffset)))
  );
}

export function previousDayAsDateStringServer(dateString: string) {
  return format(
    addDays(parse(dateString, DateFormatServer, new Date()), -1),
    DateFormatServer
  );
}

export function formatDateString(
  dateString: string,
  formatString: string = DateFormatServer
) {
  if (!dateString) {
    return "Invalid Date";
  } else {
    try {
      return format(
        parse(dateString, DateFormatServer, new Date()),
        formatString
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

export function isDateStringSunday(dateString: string) {
  return parse(dateString, DateFormatServer, new Date()).getDay() === 0;
}

export function isBankHoliday(date: Date) {
  const year = getYear(date);
  if (!bankHolidays.has(year)) {
    addYearToBankHolidays(year, bankHolidays);
  }
  const holidays = bankHolidays.get(year);
  return holidays.has(format(date, "MM/dd/yyyy"));
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

export function computeRequestedWithdrawCutoffDate(dateString: string) {
  return addBizDays(dateString, new Date().getHours() >= 12 ? 2 : 1);
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
  // Expiration date is 45 calendar days after the certification date.
  const expirationDate = addDays(date, 45);

  return format(expirationDate, DateFormatServer);
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
