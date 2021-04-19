import LinearProgress from "@material-ui/core/LinearProgress";
import { withStyles } from "@material-ui/core/styles";

const BorderLinearProgress = withStyles((theme) => ({
  root: {
    width: "100%",
    height: 10,
    borderRadius: 5,
  },
  colorPrimary: {
    backgroundColor: "rgba(122, 151, 101, 0.15)",
  },
  bar: {
    borderRadius: 5,
    backgroundColor: "primary",
  },
}))(LinearProgress);

interface Props {
  value: number | null;
}

export default function LinearProgressBar({ value }: Props) {
  return <BorderLinearProgress variant="determinate" value={value || 0.0} />;
}
