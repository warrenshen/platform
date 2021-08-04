import { Box } from "@material-ui/core";
import { formatCurrency } from "lib/currency";

interface Props {
  value: number | null;
}

export default function CurrencyDataGridCell({ value }: Props) {
  return <Box>{formatCurrency(value)}</Box>;
}
