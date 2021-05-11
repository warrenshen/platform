import { Box } from "@material-ui/core";
import { formatDatetimeString } from "lib/date";

interface Props {
  isTimeVisible?: boolean;
  datetimeString?: string;
}

export default function DatetimeDataGridCell({
  isTimeVisible = false,
  datetimeString,
}: Props) {
  return (
    <Box>
      {!!datetimeString
        ? formatDatetimeString(datetimeString, isTimeVisible)
        : "-"}
    </Box>
  );
}
