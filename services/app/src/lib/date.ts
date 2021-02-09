import { format, parse } from "date-fns";

export function formatDateString(dateString: string) {
  if (!dateString) {
    return "Invalid Date";
  } else {
    return format(parse(dateString, "yyyy-MM-dd", new Date()), "MM/dd/yyyy");
  }
}
