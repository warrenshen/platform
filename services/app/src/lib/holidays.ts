import { format } from "date-fns";
import { getBankHolidays } from "date-fns-holiday-us";

export const bankHolidays = new Map();

export function addYearToBankHolidays(
  year: number,
  bankHolidays: Map<number, Set<string>>
): void {
  const holidays = getBankHolidays(year);
  bankHolidays.set(
    year,
    new Set(
      Object.keys(holidays).map((holiday) =>
        format(holidays[holiday].date, "MM/dd/yyyy")
      )
    )
  );
}
