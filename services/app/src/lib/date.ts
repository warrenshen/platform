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

export function dateAsDateStringClient(date: Date) {
  try {
    return format(date, DateFormatClient);
  } catch (error) {
    throw new Error(
      `Could not format the date "${date}". Error message: "${error}".`
    );
  }
}

export function dateAsDateStringServer(date: Date) {
  try {
    return format(date, DateFormatServer);
  } catch (error) {
    throw new Error(
      `Could not format the date "${date}". Error message: "${error}".`
    );
  }
}

export function dateStringPlusXDaysDate(dateString: string, xDays: number) {
  return addDays(parse(dateString, DateFormatServer, new Date()), xDays);
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
  formatString: string = DateFormatClient,
  defaultIfNull: string = "Invalid Date"
) {
  if (!dateString) {
    return defaultIfNull;
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

export function getEndOfNextMonth(dateString: string) {
  const date = parse(dateString, DateFormatServer, new Date());

  if (!!date) {
    // We add two months so we can take away of the Date rollback feature to get the last day
    date.setMonth(date.getMonth() + 2);

    // using setDate with 0 sets it to the last day of the previous month
    // ref: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/setDate
    date.setDate(0);

    return format(date, DateFormatServer);
  } else {
    return "";
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
  isTimeVisible: boolean = true,
  defaultIfNull: string = "Invalid Datetime"
) {
  if (!datetimeString) {
    return defaultIfNull;
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
  // If given date is not a business day, start counting from soonest business day.
  // Ex. 05/28/21 + 2 business days = 06/02/21, since
  // 05/29/21 and 05/30/21 are weekend days and 05/31/21 is a holiday.
  const inputDate = parse(dateString, DateFormatServer, new Date());
  let resultDate = inputDate;
  while (isBankHoliday(resultDate)) {
    resultDate = addBusinessDays(resultDate, 1);
  }
  while (days > 0) {
    resultDate = addBusinessDays(resultDate, 1);
    while (isBankHoliday(resultDate)) {
      resultDate = addBusinessDays(resultDate, 1);
    }
    days -= 1;
  }
  return format(resultDate, DateFormatServer);
}

export function computePurchaseOrderDueDateCutoffDate() {
  const todayDate = new Date();
  return format(addDays(todayDate, -60), DateFormatServer);
}

export function computeRequestedWithdrawCutoffDate(dateString: string) {
  const currentHour = parseInt(
    new Date().toLocaleString("en-US", {
      timeZone: "America/Los_Angeles",
      hour: "numeric",
      hour12: false,
    })
  );
  return addBizDays(dateString, currentHour >= 12 ? 2 : 1);
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

export function isLoanComingOrPastDue(dueDate: string): [boolean, boolean] {
  const date = parse(dueDate, DateFormatServer, new Date());
  const now = new Date();

  // When due date is after current day, result will be negative
  // We don't track coming due loans for this purpose earlier than 14 days
  // Past due days will be any positive number
  const dateDiff = differenceInDays(now, date);
  const isComingDue = dateDiff <= 0 && dateDiff > -14;
  const isPastDue = dateDiff > 0;

  return [isComingDue, isPastDue];
}

export function withinNDaysOfNowOrBefore(
  dateString: string,
  days: number,
  checkPast: boolean = false
): boolean {
  if (!dateString) {
    return false;
  }
  const date = parse(dateString, DateFormatServer, new Date());
  const now = new Date();
  // When this `date` is before `now`, differenceInDays returns a negative number
  // which will be less than `days`
  const difference = checkPast
    ? Math.abs(differenceInDays(date, now))
    : differenceInDays(date, now);
  return difference <= days;
}

export const renderQuarter = (input_date: string) => {
  const d = new Date(input_date);
  const month = d.getMonth();
  const year = d.getFullYear();

  const quarterMapping: Record<string, string> = {
    "0": "1",
    "1": "1",
    "2": "1",

    "3": "2",
    "4": "2",
    "5": "2",

    "6": "3",
    "7": "3",
    "8": "3",

    "9": "4",
    "10": "4",
    "11": "4",
  };

  return `Q${quarterMapping[month]}${year}`;
};
