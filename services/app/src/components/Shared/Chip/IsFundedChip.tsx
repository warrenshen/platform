import { Box } from "@material-ui/core";
import Chip from "components/Shared/Chip";

interface Props {
  fundedAt: string;
}

function PaymentStatusChip({ fundedAt }: Props) {
  const isFunded = fundedAt && fundedAt.length > 0;
  const backgroundColor = isFunded ? "#3498db" : "#bdc3c7"; // Blue / Grey
  const label = isFunded ? "Funded" : "No Funds";
  return (
    <Box>
      <Chip color={"white"} background={backgroundColor} label={label} />
    </Box>
  );
}

export default PaymentStatusChip;
