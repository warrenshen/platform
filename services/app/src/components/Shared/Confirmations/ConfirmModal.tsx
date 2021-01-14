import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  Typography,
} from "@material-ui/core";

interface Props {
  title: string;
  errMsg: string;
  handleConfirm: () => void;
  handleClose: () => void;
}

function ConfirmModal(props: Props) {
  return (
    <Dialog open onClose={props.handleClose} maxWidth="md">
      <DialogTitle>{props.title}</DialogTitle>
      <DialogContent>
        {props.errMsg && (
          <Typography color="error" gutterBottom={true}>
            {props.errMsg}
          </Typography>
        )}
        <Grid container justify="flex-end">
          <Button
            variant="contained"
            color="primary"
            onClick={props.handleConfirm}
          >
            Confirm
          </Button>
          <Button onClick={props.handleClose}>Cancel</Button>
        </Grid>
      </DialogContent>
    </Dialog>
  );
}

export default ConfirmModal;
