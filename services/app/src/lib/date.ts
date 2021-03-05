import { addBusinessDays, addMonths, format, parse } from "date-fns";

export const DateFormatClient = "MM/dd/yyyy";
export const DateFormatServer = "yyyy-MM-dd";

export function todayAsDateStr(): string {
  return format(new Date(), DateFormatServer);
}

export function formatDateString(dateString: string) {
  if (!dateString) {
    return "Invalid Date";
  } else {
    try {
      return format(
        parse(dateString, DateFormatServer, new Date()),
        "MM/dd/yyyy"
      );
    } catch (error) {
      console.error(
        `Could not format the date string "${dateString}", returning null. Error message: "${error}".`
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
