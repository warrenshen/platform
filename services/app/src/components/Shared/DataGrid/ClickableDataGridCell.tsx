import { Box, makeStyles } from "@material-ui/core";

const useStyles = makeStyles({
  clickableCell: {
    cursor: "pointer",
    transition: "color 0.2s linear",
    "&:hover": {
      color: "var(--table-accent-color)",
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
    <Box onClick={onClick} className={classes.clickableCell}>
      {label}
    </Box>
  );
}

export default ClickableDataGridCell;
