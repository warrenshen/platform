import { Box } from "@material-ui/core";
import { format, parseISO } from "date-fns";
import { DateFormatClient, TimeFormatClient } from "lib/date";

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
            isTimeVisible
              ? `${DateFormatClient} ${TimeFormatClient}`
              : DateFormatClient
          )
        : "-"}
    </Box>
  );
}

export default DatetimeDataGridCell;
