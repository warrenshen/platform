import {
  Box,
  Button,
  Checkbox,
  createStyles,
  FormControlLabel,
  makeStyles,
  Theme,
} from "@material-ui/core";
import DownloadThumbnail from "components/Shared/File/DownloadThumbnail";
import {
  PurchaseOrderFileTypeEnum,
  RequestStatusEnum,
  usePurchaseOrderForReviewQuery,
} from "generated/graphql";
import { anonymousRoutes } from "lib/routes";
import { useState } from "react";
import { useHistory } from "react-router-dom";
import ReviewPurchaseOrderApproveModal from "./ReviewPurchaseOrderApproveModal";
import ReviewPurchaseOrderRejectModal from "./ReviewPurchaseOrderRejectModal";

interface Props {
  location: any;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    dialogTitle: {
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

function ReviewPurchaseOrderPage(props: Props) {
  const classes = useStyles();
  const location: any = props.location;

  const payload = location.state?.payload;
  const purchaseOrderId = payload?.purchase_order_id;

  const history = useHistory();
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  const {
    data,
    loading: isPurchaseOrderLoading,
  } = usePurchaseOrderForReviewQuery({
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

  if (
    purchaseOrder &&
    [RequestStatusEnum.Approved, RequestStatusEnum.Rejected].includes(
      purchaseOrder?.status
    )
  ) {
    console.log({ hello: "hello" });
    // If Purchase Order is already reviewed, redirect the user to the complete page.
    // This is so the user cannot re-review an already reviewed Purchase Order.
    history.replace(anonymousRoutes.reviewPurchaseOrderComplete);
  }

  const isDataReady = !isPurchaseOrderLoading;

  return isDataReady && purchaseOrder ? (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      width="100vw"
      height="100vh"
    >
      <Box display="flex" flexDirection="column" width="400px">
        <Box display="flex" flexDirection="column">
          <Box>
            <h2>{`${purchaseOrder.vendor?.name}, your approval is requested`}</h2>
            <p>
              The purchase order listed below requires your approval before we
              can process payment. Please review the information and press
              either the approve or reject button. If you press reject, you will
              be prompted to enter in a reason.
            </p>
          </Box>
          <Box display="flex" flexDirection="row" m={1}>
            <p className={classes.propertyLabel}>
              <strong>Order Number:</strong>
            </p>
            <p>{purchaseOrder.order_number}</p>
          </Box>
          <Box display="flex" flexDirection="row" m={1}>
            <p className={classes.propertyLabel}>
              <strong>Amount:</strong>
            </p>
            <p>{purchaseOrder.amount}</p>
          </Box>
          <Box display="flex" flexDirection="row" m={1}>
            <p className={classes.propertyLabel}>
              <strong>Order Date:</strong>
            </p>
            <p>{purchaseOrder.order_date}</p>
          </Box>
          <Box display="flex" flexDirection="row" m={1}>
            <p className={classes.propertyLabel}>
              <strong>Debtor:</strong>
            </p>
            <p>{purchaseOrder.company?.name}</p>
          </Box>
        </Box>
        <Box flexDirection="column" flexGrow={1}>
          <Box display="flex" flexDirection="row" m={1}>
            <p className={classes.propertyLabel}>
              <strong>Status</strong>
            </p>
            <p>{purchaseOrder.status}</p>
          </Box>
          <Box>
            <DownloadThumbnail
              fileIds={purchaseOrderFile ? [purchaseOrderFile.file_id] : []}
            ></DownloadThumbnail>
          </Box>
          <Box>
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
          {purchaseOrder?.is_cannabis && (
            <Box>
              <DownloadThumbnail
                fileIds={purchaseOrderCannabisFiles?.map(
                  (purchaseOrderFile) => purchaseOrderFile.file_id
                )}
              ></DownloadThumbnail>
            </Box>
          )}
        </Box>
        <Box display="flex" justifyContent="space-between">
          <Button
            disabled={false}
            onClick={() => setIsRejectModalOpen(true)}
            variant={"contained"}
            color={"secondary"}
          >
            Reject
          </Button>
          <Button
            disabled={false}
            onClick={() => setIsApproveModalOpen(true)}
            variant={"contained"}
            color={"primary"}
          >
            Approve
          </Button>
          {isApproveModalOpen && (
            <ReviewPurchaseOrderApproveModal
              purchaseOrder={purchaseOrder}
              handleClose={() => setIsApproveModalOpen(false)}
              handleApproveSuccess={() =>
                history.push({
                  pathname: anonymousRoutes.reviewPurchaseOrderComplete,
                })
              }
            ></ReviewPurchaseOrderApproveModal>
          )}
          {isRejectModalOpen && (
            <ReviewPurchaseOrderRejectModal
              purchaseOrderId={purchaseOrder?.id}
              handleClose={() => setIsRejectModalOpen(false)}
              handleRejectSuccess={() =>
                history.push({
                  pathname: anonymousRoutes.reviewPurchaseOrderComplete,
                })
              }
            ></ReviewPurchaseOrderRejectModal>
          )}
        </Box>
      </Box>
    </Box>
  ) : null;
}

export default ReviewPurchaseOrderPage;
