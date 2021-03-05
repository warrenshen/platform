import { Box } from "@material-ui/core";
import { format, parseISO } from "date-fns";

interface Props {
  isTimeVisible?: boolean;
  datetimeString?: string;
}

function DatetimeDataGridCell({ isTimeVisible, datetimeString }: Props) {
  return (
    <Box>
      {datetimeString
        ? format(
            parseISO(datetimeString),
            isTimeVisible ? "MM/dd/yyyy HH:mm:ss" : "MM/dd/yyyy"
          )
        : "-"}
    </Box>
  );
}

export default DatetimeDataGridCell;
