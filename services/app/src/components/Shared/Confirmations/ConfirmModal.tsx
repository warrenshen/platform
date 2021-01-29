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
  errorMessage: string;
  handleConfirm: () => void;
  handleClose: () => void;
}

function ConfirmModal(props: Props) {
  return (
    <Dialog open onClose={props.handleClose} maxWidth="sm">
      <DialogTitle>{props.title}</DialogTitle>
      <DialogContent>
        {props.errorMessage && (
          <Typography color="error" gutterBottom={true}>
            {props.errorMessage}
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
