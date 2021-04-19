import { withStyles } from "@material-ui/core/styles";
import LinearProgress from "@material-ui/core/LinearProgress";

const BorderLinearProgress = withStyles((theme) => ({
  root: {
    height: 10,
    borderRadius: 5,
  },
  colorPrimary: {
    backgroundColor:
      theme.palette.grey[theme.palette.type === "light" ? 200 : 700],
  },
  bar: {
    borderRadius: 5,
    backgroundColor: "primary",
  },
}))(LinearProgress);

interface Props {
  value?: number;
}

function ProgressBar({ value = 0 }: Props) {
  return <BorderLinearProgress variant="determinate" value={value} />;
}

export default ProgressBar;
