import { Box } from "@material-ui/core";
import { format, parse, parseISO } from "date-fns";

interface Props {
  dateString?: string;
}

interface DatetimeProps {
  datetimeString?: string;
}

export function DatetimeDataGridCell({ datetimeString }: DatetimeProps) {
  return (
    <Box>
      {datetimeString ? format(parseISO(datetimeString), "MM/dd/yyyy") : ""}
    </Box>
  );
}

function DateDataGridCell({ dateString }: Props) {
  return (
    <Box>
      {dateString
        ? format(parse(dateString, "yyyy-MM-dd", new Date()), "MM/dd/yyyy")
        : ""}
    </Box>
  );
}

export default DateDataGridCell;
