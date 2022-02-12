import { Box } from "@material-ui/core";

interface Props {
  value: number | null;
}

export default function PercentageDataGridCell({ value }: Props) {
  return <Box>{value}%</Box>;
}
