import {
  Box,
  Button,
  Checkbox,
  createStyles,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  makeStyles,
  Theme,
  Typography,
} from "@material-ui/core";
import DownloadThumbnail from "components/Shared/File/DownloadThumbnail";
import {
  PurchaseOrderFileTypeEnum,
  usePurchaseOrderQuery,
} from "generated/graphql";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    dialog: {
      width: 400,
    },
    dialogTitle: {
      paddingLeft: theme.spacing(3),
      borderBottom: "1px solid #c7c7c7",
    },
    buttonClass: {
      marginLeft: theme.spacing(1),
    },
    propertyLabel: {
      flexGrow: 1,
    },
    constLabels: {
      minWidth: 150,
    },
    dialogActions: {
      margin: theme.spacing(2),
      marginTop: 0,
      marginBottom: theme.spacing(2),
    },
  })
);

interface Props {
  purchaseOrderId: string;
  handleClose: () => void;
}

function ViewPurchaseOrderModal({ purchaseOrderId, handleClose }: Props) {
  const classes = useStyles();
  const { data } = usePurchaseOrderQuery({
    variables: {
      id: purchaseOrderId,
    },
  });
  const purchaseOrder = data?.purchase_orders_by_pk;

  const purchaseOrderFile = purchaseOrder?.purchase_order_files.filter(
    (purchaseOrderFile) =>
      purchaseOrderFile.file_type === PurchaseOrderFileTypeEnum.PurchaseOrder
  )[0];
  const purchaseOrderCannabisFiles = purchaseOrder
    ? purchaseOrder.purchase_order_files.filter(
        (purchaseOrderFile) =>
          purchaseOrderFile.file_type === PurchaseOrderFileTypeEnum.Cannabis
      )
    : [];

  return purchaseOrder ? (
    <Dialog
      open
      onClose={handleClose}
      maxWidth="xl"
      classes={{ paper: classes.dialog }}
    >
      <DialogTitle className={classes.dialogTitle}>
        Purchase Order Details
      </DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column">
          <Box display="flex" flexDirection="row" mt={1}>
            <p className={classes.propertyLabel}>
              <strong>Order Number:</strong>
            </p>
            <p>{purchaseOrder?.order_number}</p>
          </Box>
          <Box display="flex" flexDirection="row" mt={1}>
            <p className={classes.propertyLabel}>
              <strong>Order Date:</strong>
            </p>
            <p>{purchaseOrder?.order_date}</p>
          </Box>
          <Box display="flex" flexDirection="row" mt={1}>
            <p className={classes.propertyLabel}>
              <strong>Delivery Date:</strong>
            </p>
            <p>{purchaseOrder?.delivery_date}</p>
          </Box>
          <Box display="flex" flexDirection="row" mt={1}>
            <p className={classes.propertyLabel}>
              <strong>Amount:</strong>
            </p>
            <p>{purchaseOrder?.amount}</p>
          </Box>
          <Box display="flex" flexDirection="row" mt={1}>
            <p className={classes.propertyLabel}>
              <strong>Debtor:</strong>
            </p>
            <p>{purchaseOrder?.company?.name}</p>
          </Box>
          <Box display="flex" flexDirection="row" mt={1}>
            <p className={classes.propertyLabel}>
              <strong>Status</strong>
            </p>
            <p>{purchaseOrder?.status}</p>
          </Box>
          <Box display="flex" flexDirection="row" mt={1}>
            <p className={classes.propertyLabel}>
              <strong>Vendor:</strong>
            </p>
            <p>{purchaseOrder?.vendor?.name}</p>
          </Box>
          <Box>
            <Typography variant="subtitle1" color="textSecondary">
              Purchase Order File Attachment
            </Typography>
            {purchaseOrderFile && (
              <DownloadThumbnail
                fileIds={[purchaseOrderFile.file_id]}
              ></DownloadThumbnail>
            )}
          </Box>
          <Box mt={2}>
            <FormControlLabel
              control={
                <Checkbox
                  disabled={true}
                  checked={!!purchaseOrder?.is_cannabis}
                ></Checkbox>
              }
              label={"Order includes cannabis or derivatives"}
            ></FormControlLabel>
          </Box>
          {!!purchaseOrder?.is_cannabis && (
            <Box mt={2}>
              <Typography variant="subtitle1" color="textSecondary">
                Cannabis File Attachments
              </Typography>
              {purchaseOrderCannabisFiles.length > 0 && (
                <DownloadThumbnail
                  fileIds={purchaseOrderCannabisFiles.map(
                    (purchaseOrderFile) => purchaseOrderFile.file_id
                  )}
                ></DownloadThumbnail>
              )}
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        <Box>
          <Button
            className={classes.buttonClass}
            variant="contained"
            color="default"
            onClick={handleClose}
          >
            Close
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  ) : null;
}

export default ViewPurchaseOrderModal;
