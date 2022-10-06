import { Box } from "@material-ui/core";
import LinearProgress from "@material-ui/core/LinearProgress";
import { withStyles } from "@material-ui/core/styles";
import { formatCurrency } from "lib/number";
import { round } from "lodash";

const BorderLinearProgressBar = withStyles((theme) => ({
  root: {
    width: "100%",
    height: 16,
    borderRadius: 5,
  },
  colorPrimary: {
    backgroundColor: "#F6F5F3",
    border: "1px solid #D5D3D0",
  },
  bar: {
    borderRadius: 5,
    backgroundColor: "primary",
  },
}))(LinearProgress);

interface Props {
  amountFunded: number;
  totalAmount: number;
}

export default function ProgressBar({ amountFunded, totalAmount }: Props) {
  const roundedPercentValue = round((amountFunded / totalAmount) * 100, 2);
  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      <BorderLinearProgressBar
        variant="determinate"
        value={roundedPercentValue}
      />
      <Box display="flex" mt={1}>
        <strong style={{ marginRight: 4 }}>
          {formatCurrency(totalAmount - amountFunded)}
        </strong>
        <span>{"left to request financing for"}</span>
      </Box>
    </Box>
  );
}
