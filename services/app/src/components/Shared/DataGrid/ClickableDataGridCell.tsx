import { Button, makeStyles } from "@material-ui/core";

const useStyles = makeStyles({
  clickableCell: {
    color: "var(--table-accent-color)",
    minWidth: 0,
    textTransform: "initial",
    padding: "4px",
    "&:hover": {
      background: "var(--table-accent-color-opacity)",
    },
  },
});

interface Props {
  onClick: () => void;
  label: string;
}

function ClickableDataGridCell({ onClick, label }: Props) {
  const classes = useStyles();

  return (
    <Button className={classes.clickableCell} onClick={onClick}>
      {label}
    </Button>
  );
}

export default ClickableDataGridCell;
