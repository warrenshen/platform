import { format, parse } from "date-fns";

export const DateFormatClient = "MM/dd/yyyy";
export const DateFormatServer = "yyyy-MM-dd";

export function formatDateString(dateString: string) {
  if (!dateString) {
    return "Invalid Date";
  } else {
    return format(
      parse(dateString, DateFormatServer, new Date()),
      "MM/dd/yyyy"
    );
  }
}
