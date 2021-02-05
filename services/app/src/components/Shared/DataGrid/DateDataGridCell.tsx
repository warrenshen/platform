import { Box } from "@material-ui/core";
import { format, parse } from "date-fns";

interface Props {
  dateString?: string;
}

function DateDataGridCell({ dateString }: Props) {
  return (
    <Box>
      {dateString
        ? format(parse(dateString, "yyyy-MM-dd", new Date()), "MM/dd/yyyy")
        : "None"}
    </Box>
  );
}

export default DateDataGridCell;
