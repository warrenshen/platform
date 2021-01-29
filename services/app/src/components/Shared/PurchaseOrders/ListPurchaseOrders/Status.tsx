import Chip from "components/Shared/Chip";
import { CellValue } from "@material-ui/data-grid";

interface IColorKeys {
  [key: string]: string;
}

const purchaseOrderStatusColors: IColorKeys = {
  approval_requested: "#f0ad4e",
  approved: "#5cb85c",
  drafted: "#eeeeee",
  rejected: "#df4646",
};

const getColor = (status: any): string => purchaseOrderStatusColors[status];

function Status({ statusValue }: { statusValue: CellValue }) {
  const background = getColor(statusValue);
  return <Chip label={statusValue} background={background} />;
}

export default Status;
