import { Box } from "@material-ui/core";
import { format, parse } from "date-fns";
import { DateFormatClient, DateFormatServer } from "lib/date";

interface Props {
  dateString?: string;
}

function DateDataGridCell({ dateString }: Props) {
  return (
    <Box>
      {dateString
        ? format(
            parse(dateString, DateFormatServer, new Date()),
            DateFormatClient
          )
        : "-"}
    </Box>
  );
}

export default DateDataGridCell;
