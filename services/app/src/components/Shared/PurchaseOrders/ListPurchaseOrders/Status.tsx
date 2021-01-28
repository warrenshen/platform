import { createStyles, makeStyles } from "@material-ui/core";
import Chip from "@material-ui/core/Chip";
import { CellValue } from "@material-ui/data-grid";
interface IObjectKeys {
  [key: string]: string | number;
}

const purchaseOrderStatusColor: IObjectKeys = {
  approval_requested: "#eeeeee",
  approved: "#5cb85c",
  drafted: "#f0ad4e",
  rejected: "#df4646",
};

const useStyles = makeStyles(() =>
  createStyles({
    statusLabel: {
      background: ({ color }: { color: string | number }) => color,
    },
  })
);

const getColor = (status: any): string | number =>
  purchaseOrderStatusColor[status];

function Status({ statusValue }: { statusValue: CellValue }) {
  const color = getColor(statusValue);
  const classes = useStyles({ color });
  return (
    <Chip size="small" className={classes.statusLabel} label={statusValue} />
  );
}

export default Status;
