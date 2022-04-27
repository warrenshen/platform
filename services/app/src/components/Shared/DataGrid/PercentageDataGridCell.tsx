import { Box } from "@material-ui/core";
import { formatPercentage } from "lib/number";

interface Props {
  value: number | null;
}

export default function PercentageDataGridCell({ value }: Props) {
  return <Box>{formatPercentage(value)}</Box>;
}
