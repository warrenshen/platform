import { Box } from "@material-ui/core";
import { formatCurrency } from "lib/number";

interface Props {
  value: number | null;
}

export default function CurrencyDataGridCell({ value }: Props) {
  return <Box>{formatCurrency(value)}</Box>;
}
