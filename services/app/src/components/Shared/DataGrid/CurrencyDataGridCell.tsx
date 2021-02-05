import { Box } from "@material-ui/core";
import { formatCurrency } from "lib/currency";

interface Props {
  value: number | null;
}

function CurrencyDataGridCell({ value }: Props) {
  return <Box>{value !== null ? formatCurrency(value) : "None"}</Box>;
}

export default CurrencyDataGridCell;
