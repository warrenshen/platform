import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@material-ui/core";

interface Props {
  handleClose: () => void;
}

function PayOffLoansModal({ handleClose }: Props) {
  return (
    <Dialog open onClose={handleClose} fullWidth>
      <DialogTitle>Pay Off Loans</DialogTitle>
      <DialogContent />
      <DialogActions />
    </Dialog>
  );
}

export default PayOffLoansModal;
