import {
  Box,
  Checkbox,
  Drawer,
  FormControlLabel,
  makeStyles,
  Typography,
} from "@material-ui/core";
import RequestStatusChip from "components/Shared/Chip/RequestStatusChip";
import DownloadThumbnail from "components/Shared/File/DownloadThumbnail";
import {
  PurchaseOrderFileTypeEnum,
  PurchaseOrders,
  usePurchaseOrderQuery,
} from "generated/graphql";
import { formatCurrency } from "lib/currency";
import { formatDateString } from "lib/date";

const useStyles = makeStyles({
  drawerContent: {
    width: 400,
  },
  propertyLabel: {
    flexGrow: 1,
  },
});

interface Props {
  purchaseOrderId: PurchaseOrders["id"];
  handleClose: () => void;
}

function PurchaseOrderDrawer({ purchaseOrderId, handleClose }: Props) {
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
    <Drawer open anchor="right" onClose={handleClose}>
      <Box className={classes.drawerContent} p={4}>
        <Typography variant="h5">Purchase Order</Typography>
        <Box display="flex" flexDirection="column">
          <Box display="flex" flexDirection="column" mt={2}>
            <Typography variant="subtitle2" color="textSecondary">
              Company
            </Typography>
            <Typography variant={"body1"}>
              {purchaseOrder.company?.name}
            </Typography>
          </Box>
          <Box display="flex" flexDirection="column" mt={2}>
            <Typography variant="subtitle2" color="textSecondary">
              Order Number
            </Typography>
            <Typography variant={"body1"}>
              {purchaseOrder.order_number}
            </Typography>
          </Box>
          <Box display="flex" flexDirection="column" mt={2}>
            <Typography variant="subtitle2" color="textSecondary">
              Vendor
            </Typography>
            <Typography variant={"body1"}>
              {purchaseOrder.vendor?.name}
            </Typography>
          </Box>
          <Box display="flex" flexDirection="column" mt={2}>
            <Typography variant="subtitle2" color="textSecondary">
              Order Date
            </Typography>
            <Typography variant={"body1"}>
              {formatDateString(purchaseOrder.order_date)}
            </Typography>
          </Box>
          <Box display="flex" flexDirection="column" mt={2}>
            <Typography variant="subtitle2" color="textSecondary">
              Delivery Date
            </Typography>
            <Typography variant={"body1"}>
              {formatDateString(purchaseOrder.delivery_date)}
            </Typography>
          </Box>
          <Box display="flex" flexDirection="column" mt={2}>
            <Typography variant="subtitle2" color="textSecondary">
              Amount
            </Typography>
            <Typography variant={"body1"}>
              {formatCurrency(purchaseOrder.amount)}
            </Typography>
          </Box>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="flex-start"
            mt={2}
          >
            <Typography variant="subtitle2" color="textSecondary">
              Status
            </Typography>
            <RequestStatusChip
              requestStatus={purchaseOrder.status}
            ></RequestStatusChip>
          </Box>
          <Box display="flex" flexDirection="column" mt={2}>
            <Typography variant="subtitle2" color="textSecondary">
              Purchase Order File Attachment
            </Typography>
            {purchaseOrderFile && (
              <DownloadThumbnail
                fileIds={[purchaseOrderFile.file_id]}
              ></DownloadThumbnail>
            )}
          </Box>
          <Box display="flex" flexDirection="column" mt={2}>
            <FormControlLabel
              control={
                <Checkbox
                  disabled={true}
                  checked={!!purchaseOrder.is_cannabis}
                ></Checkbox>
              }
              label={"Order includes cannabis or derivatives"}
            ></FormControlLabel>
          </Box>
          {!!purchaseOrder.is_cannabis && (
            <Box display="flex" flexDirection="column" mt={2}>
              <Typography variant="subtitle2" color="textSecondary">
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
      </Box>
    </Drawer>
  ) : null;
}

export default PurchaseOrderDrawer;
