import { makeStyles } from "@material-ui/core";
import { CellValue } from "@material-ui/data-grid";
import ClearIcon from "@material-ui/icons/Clear";
import DoneIcon from "@material-ui/icons/Done";
import Chip from "components/Shared/Chip";

const useStyles = makeStyles({
  icon: {
    color: ({ color }: { color: string }) => color,
  },
});

function VerificationChip({ value }: { value: CellValue }) {
  const classes = useStyles({ color: "white" });
  const parsedValue = (value === "Yes" || value === "No"
    ? value
    : value
    ? "yes"
    : "no"
  ).toLowerCase();

  const background =
    parsedValue === "yes" ? "var(--table-accent-color)" : "disabled";

  const icon: JSX.Element =
    parsedValue === "yes" ? (
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
