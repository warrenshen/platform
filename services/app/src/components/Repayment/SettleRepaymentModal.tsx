import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@material-ui/core";
import { Payments, useGetPaymentQuery } from "generated/graphql";

interface Props {
  paymentId: Payments["id"];
  handleClose: () => void;
}

function SettleRepaymentModal({ paymentId, handleClose }: Props) {
  const { data } = useGetPaymentQuery({ variables: { id: paymentId } });

  const payment = data?.payments_by_pk;
  console.log({ payment });
  const handleClickNext = async () => {};

  return (
    <Dialog open fullWidth maxWidth="md" onClose={handleClose}>
      <DialogTitle>Settle Payment</DialogTitle>
      <DialogContent>
        <Box />
      </DialogContent>
      <DialogActions>
        <Button
          disabled={false}
          variant="contained"
          color="primary"
          onClick={handleClickNext}
        >
          Next
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default SettleRepaymentModal;
