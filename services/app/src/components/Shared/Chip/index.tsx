import { makeStyles } from "@material-ui/core";
import { Chip as ChipMaterial } from "@material-ui/core";
import { CellValue } from "@material-ui/data-grid";

const useStyles = makeStyles({
  chip: {
    background: ({ background }: { background: string; color: string }) =>
      background,
    color: ({ color }: { color: string; background: string }) => color,
  },
});

function Chip({
  label,
  background,
  color,
  icon,
}: {
  label: CellValue;
  icon?: JSX.Element;
  background?: string;
  color?: string;
}) {
  const classes = useStyles({
    background: background || "disabled",
    color: color || "black",
  });
  return (
    <ChipMaterial
      size="small"
      className={classes.chip}
      label={label}
      icon={icon}
    />
  );
}

export default Chip;
