import {
  Box,
  Button,
  createStyles,
  makeStyles,
  Theme,
  Typography,
} from "@material-ui/core";
import DownloadThumbnail from "components/Shared/File/DownloadThumbnail";
import {
  PurchaseOrderFileTypeEnum,
  RequestStatusEnum,
  usePurchaseOrderForReviewQuery,
} from "generated/graphql";
import { formatCurrency } from "lib/currency";
import { formatDateString } from "lib/date";
import { FileTypeEnum } from "lib/enum";
import { anonymousRoutes } from "lib/routes";
import { useMemo, useState } from "react";
import { useHistory } from "react-router-dom";
import ReviewPurchaseOrderApproveModal from "./ReviewPurchaseOrderApproveModal";
import ReviewPurchaseOrderRejectModal from "./ReviewPurchaseOrderRejectModal";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    wrapper: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      width: "100vw",
      height: "100vh",
      overflow: "scroll",
    },
    container: {
      display: "flex",
      flexDirection: "column",
      width: "100%",
      maxWidth: 500,
      paddingTop: theme.spacing(8),
      paddingBottom: theme.spacing(8),
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2),
    },
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
    },
  })
);

interface Props {
  location: any;
}

function ReviewPurchaseOrderPage({ location }: Props) {
  const classes = useStyles();

  const payload = location.state?.payload;
  const linkVal = location.state?.link_val;
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
  const purchaseOrderFileIds = useMemo(() => {
    const purchaseOrderFile = purchaseOrder?.purchase_order_files.filter(
      (purchaseOrderFile) =>
        purchaseOrderFile.file_type === PurchaseOrderFileTypeEnum.PurchaseOrder
    )[0];
    return purchaseOrderFile ? [purchaseOrderFile.file_id] : [];
  }, [purchaseOrder]);
  const purchaseOrderCannabisFileIds = useMemo(() => {
    return (
      purchaseOrder?.purchase_order_files
        .filter(
          (purchaseOrderFile) =>
            purchaseOrderFile.file_type === PurchaseOrderFileTypeEnum.Cannabis
        )
        .map((purchaseOrderFile) => purchaseOrderFile.file_id) || []
    );
  }, [purchaseOrder]);

  if (
    purchaseOrder &&
    [RequestStatusEnum.Approved, RequestStatusEnum.Rejected].includes(
      purchaseOrder?.status
    )
  ) {
    // If Purchase Order is already reviewed, redirect the user to the complete page.
    // This is so the user cannot re-review an already reviewed Purchase Order.
    history.replace(anonymousRoutes.reviewPurchaseOrderComplete);
  }

  const isDataReady = !isPurchaseOrderLoading;

  return isDataReady && purchaseOrder ? (
    <Box className={classes.wrapper}>
      <Box className={classes.container}>
        <Box display="flex" flexDirection="column">
          <Typography variant="h5">{`${purchaseOrder.vendor?.name}, your approval is requested`}</Typography>
          <Box mt={1}>
            <Typography variant="body2">
              The purchase order shown below requires your approval before
              Bespoke Financial can finance it. Please review the info and press
              either approve or reject. If you press reject, you will be
              prompted to enter in a reason.
            </Typography>
          </Box>
        </Box>
        <Box display="flex" flexDirection="column" mt={2}>
          <Typography variant="subtitle2" color="textSecondary">
            Buyer
          </Typography>
          <Typography variant={"body1"}>
            {purchaseOrder.company?.name}
          </Typography>
        </Box>
        <Box display="flex" flexDirection="column" mt={2}>
          <Typography variant="subtitle2" color="textSecondary">
            PO Number
          </Typography>
          <Typography variant={"body1"}>
            {purchaseOrder.order_number}
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
        <Box display="flex" flexDirection="column" mt={2}>
          <Typography variant="subtitle2" color="textSecondary">
            PO Date
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
            Purchase Order File
          </Typography>
          <DownloadThumbnail
            fileIds={purchaseOrderFileIds}
            fileType={FileTypeEnum.PURCHASE_ORDER}
          />
        </Box>
        {purchaseOrder?.is_cannabis && (
          <Box display="flex" flexDirection="column" mt={2}>
            <Typography variant="subtitle2" color="textSecondary">
              Cannabis or Derivatives File(s)
            </Typography>
            <DownloadThumbnail
              fileIds={purchaseOrderCannabisFileIds}
              fileType={FileTypeEnum.PURCHASE_ORDER}
            />
          </Box>
        )}
        <Box display="flex" justifyContent="center" mt={4}>
          {isApproveModalOpen && (
            <ReviewPurchaseOrderApproveModal
              purchaseOrder={purchaseOrder}
              linkVal={linkVal}
              handleClose={() => setIsApproveModalOpen(false)}
              handleApproveSuccess={() => {
                history.push({
                  pathname: anonymousRoutes.reviewPurchaseOrderComplete,
                });
              }}
            />
          )}
          {isRejectModalOpen && (
            <ReviewPurchaseOrderRejectModal
              purchaseOrderId={purchaseOrder?.id}
              linkVal={linkVal}
              handleClose={() => setIsRejectModalOpen(false)}
              handleRejectSuccess={() =>
                history.push({
                  pathname: anonymousRoutes.reviewPurchaseOrderComplete,
                })
              }
            />
          )}
          <Box mr={2}>
            <Button
              disabled={false}
              onClick={() => setIsRejectModalOpen(true)}
              variant={"contained"}
              color={"default"}
            >
              Reject
            </Button>
          </Box>
          <Box>
            <Button
              disabled={false}
              onClick={() => setIsApproveModalOpen(true)}
              variant={"contained"}
              color={"primary"}
            >
              Approve
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  ) : null;
}

export default ReviewPurchaseOrderPage;
