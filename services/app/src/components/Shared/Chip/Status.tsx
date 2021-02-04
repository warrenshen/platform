import { CellValue } from "@material-ui/data-grid";
import Chip from "components/Shared/Chip";

interface IColorKeys {
  [key: string]: string;
}

const StatusToColor: IColorKeys = {
  drafted: "#bdc3c7", // Gray
  approval_requested: "#f1c40f", // Yellow
  approved: "#2ecc71", // Green
  rejected: "#e67e22", // Orange
  past_due: "#e74c3c", // Red
  funded: "#3498db", // Blue
  closed: "#9b59b6", // Purple
};

const getColor = (status: any): string => StatusToColor[status];

function Status({ statusValue }: { statusValue: CellValue }) {
  const background = getColor(statusValue);
  return (
    <Chip label={statusValue} color={"white"} background={background}></Chip>
  );
}

export default Status;
