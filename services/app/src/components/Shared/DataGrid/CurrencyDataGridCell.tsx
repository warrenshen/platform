import { Box } from "@material-ui/core";
import { formatCurrency } from "lib/currency";

interface Props {
  value?: number;
}

function CurrencyDataGridCell({ value }: Props) {
  return <Box>{value ? formatCurrency(value) : "None"}</Box>;
}

export default CurrencyDataGridCell;
