import Chip from "components/Shared/Chip";
import { CellValue } from "@material-ui/data-grid";
import DoneIcon from "@material-ui/icons/Done";
import ClearIcon from "@material-ui/icons/Clear";

import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles({
  icon: {
    color: ({ color }: { color: string }) => color,
  },
});

function VerificationChip({ value }: { value: CellValue }) {
  const classes = useStyles({ color: "white" });
  const background = value ? "var(--table-accent-color)" : "disabled";
  const parsedValue = value ? "yes" : "no";
  const icon: JSX.Element = value ? (
    <DoneIcon className={classes.icon} />
  ) : (
    <ClearIcon className={classes.icon} />
  );
  return (
    <Chip
      label={parsedValue}
      icon={icon}
      background={background}
      color={"white"}
    />
  );
}

export default VerificationChip;
