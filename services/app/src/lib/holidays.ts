import { addDays, format, isSaturday, isSunday } from "date-fns";
import { getBankHolidays, Holiday } from "date-fns-holiday-us";

export type Holidays = {
  [K in Holiday]: {
    date: Date;
    bankHoliday: boolean;
  };
};

function getObservedBankHolidays(
  year: number
): Record<string, Record<"date", Date>> {
  const holidays = getBankHolidays(year) as Holidays;
  return Object.keys(holidays).reduce((acc, holidayName) => {
    const holiday = holidays[holidayName as Holiday];
    if (isSaturday(holiday.date)) {
      return {
        ...acc,
        [holidayName]: {
          date: addDays(holiday.date, -1),
        },
      };
    } else if (isSunday(holiday.date)) {
      return {
        ...acc,
        [holidayName]: {
          date: addDays(holiday.date, 1),
        },
      };
    } else {
      return {
        ...acc,
        [holidayName]: holiday,
      };
    }
  }, {});
}

export const bankHolidays = new Map();

export function addYearToBankHolidays(
  year: number,
  bankHolidays: Map<number, Set<string>>
): void {
  const holidayNameToHoliday = getObservedBankHolidays(year);
  const holidays = new Set(
    Object.keys(holidayNameToHoliday).map((holiday) =>
      format(holidayNameToHoliday[holiday].date, "MM/dd/yyyy")
    )
  );
  bankHolidays.set(year, holidays);
}
