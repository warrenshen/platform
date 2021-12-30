import { addDays, format, isSaturday, isSunday } from "date-fns";
import { getBankHolidays, Holiday } from "date-fns-holiday-us";

export type Holidays = {
  [K in Holiday]: {
    date: Date;
    bankHoliday: boolean;
  };
};

function getBankHolidaysByYear(year: number) {
  const holidayNameToHoliday = getBankHolidays(year) as Holidays;
  return Object.keys(holidayNameToHoliday).map(
    (holiday) => holidayNameToHoliday[holiday as Holiday].date
  );
}

function getObservedBankHolidays(year: number) {
  const currentYearHolidays = getBankHolidaysByYear(year);
  const nextYearHolidays = getBankHolidaysByYear(year + 1);
  const holidays = [...currentYearHolidays, ...nextYearHolidays];
  const observedHolidays = holidays.map((bankHoliday) => {
    if (isSaturday(bankHoliday)) {
      return addDays(bankHoliday, -1);
    } else if (isSunday(bankHoliday)) {
      return addDays(bankHoliday, 1);
    } else {
      return null;
    }
  });
  const validObservedHolidays = observedHolidays.filter(
    (bankHoliday) => bankHoliday !== null
  ) as Date[];
  return [...holidays, ...validObservedHolidays];
}

export const bankHolidays = new Map();

export function addYearToBankHolidays(
  year: number,
  bankHolidays: Map<number, Set<string>>
): void {
  const observedBankHolidays = getObservedBankHolidays(year);
  const holidays = new Set(
    observedBankHolidays.map((date) => format(date, "MM/dd/yyyy"))
  );
  bankHolidays.set(year, holidays);
}
