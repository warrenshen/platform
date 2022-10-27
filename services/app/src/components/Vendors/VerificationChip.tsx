import { makeStyles } from "@material-ui/core";
import ClearIcon from "@material-ui/icons/Clear";
import DoneIcon from "@material-ui/icons/Done";
import Chip from "components/Shared/Chip";

const useStyles = makeStyles({
  icon: {
    color: ({ color }: { color: string }) => color,
  },
});

export default function VerificationChip({ value }: { value: any }) {
  const classes = useStyles({ color: "white" });
  const isVerified = !!value;

  const background = isVerified ? "var(--table-accent-color)" : "disabled";

  const icon: JSX.Element = isVerified ? (
    <DoneIcon className={classes.icon} />
  ) : (
    <ClearIcon className={classes.icon} />
  );

  return (
    <Chip
      label={isVerified ? "Y" : "N"}
      icon={icon}
      background={background}
      color={"white"}
    />
  );
}
