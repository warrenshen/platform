import { Button, makeStyles } from "@material-ui/core";
import { Link } from "react-router-dom";

const useStyles = makeStyles({
  clickableCell: {
    color: "var(--table-accent-color)",
    minWidth: 0,
    textAlign: "left",
    textTransform: "initial",
    padding: "4px",
    "&:hover": {
      background: "var(--table-accent-color-opacity)",
    },
  },
});

interface Props {
  onClick?: () => void;
  label: string;
  url?: string;
}

function ClickableDataGridCell({ onClick, label, url }: Props) {
  const classes = useStyles();

  return (
    <Button
      className={classes.clickableCell}
      {...(url ? { component: Link, to: url } : {})}
      onClick={onClick}
    >
      {label}
    </Button>
  );
}

export default ClickableDataGridCell;
