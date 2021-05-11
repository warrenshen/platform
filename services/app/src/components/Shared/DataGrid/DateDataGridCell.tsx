import { Box } from "@material-ui/core";
import { formatDateString } from "lib/date";

interface Props {
  dateString?: string;
}

export default function DateDataGridCell({ dateString }: Props) {
  return <Box>{!!dateString ? formatDateString(dateString) : "-"}</Box>;
}
