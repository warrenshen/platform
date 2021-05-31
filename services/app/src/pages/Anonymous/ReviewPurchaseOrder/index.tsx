import {
  Box,
  Button,
  createStyles,
  makeStyles,
  Theme,
  Typography,
} from "@material-ui/core";
import DownloadThumbnail from "components/Shared/File/DownloadThumbnail";
import MetrcTransferInfoCardForVendor from "components/Transfers/MetrcTransferInfoCardForVendor";
import {
  PurchaseOrderFileTypeEnum,
  RequestStatusEnum,
  useGetPurchaseOrderForReviewQuery,
} from "generated/graphql";
import { formatCurrency } from "lib/currency";
import { formatDateString } from "lib/date";
import { FileTypeEnum } from "lib/enum";
import { anonymousRoutes } from "lib/routes";
import { useMemo, useState } from "react";
import { useHistory } from "react-router-dom";
import ReviewPurchaseOrderApproveModal from "./ReviewPurchaseOrderApproveModal";
import ReviewPurchaseOrderRejectModal from "./ReviewPurchaseOrderRejectModal";
import styled from "styled-components";

const Buttons = styled.div`
  display: flex;

  width: 100%;
`;

const StyledButton = styled(Button)`
  flex: 1;

  padding: 8px 0px;
`;

const ButtonSpace = styled.div`
  width: 12px;
`;

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
  })
);

interface Props {
  location: any;
}

export default function ReviewPurchaseOrderPage({ location }: Props) {
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
  } = useGetPurchaseOrderForReviewQuery({
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
  const purchaseOrderCannabisFileIds = useMemo(
    () =>
      purchaseOrder?.purchase_order_files
        .filter(
          (purchaseOrderFile) =>
            purchaseOrderFile.file_type === PurchaseOrderFileTypeEnum.Cannabis
        )
        .map((purchaseOrderFile) => purchaseOrderFile.file_id) || [],
    [purchaseOrder]
  );

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

  if (!isDataReady || !purchaseOrder) {
    return null;
  }

  const isMetrcBased = !!purchaseOrder.is_metrc_based;
  const metrcTransfers = purchaseOrder.purchase_order_metrc_transfers.map(
    (purchaseOrderMetrcTransfer) => purchaseOrderMetrcTransfer.metrc_transfer
  );

  return (
    <Box className={classes.wrapper}>
      <Box className={classes.container}>
        <Box display="flex" flexDirection="column">
          <Typography variant="h5">{`${purchaseOrder.vendor?.name}, your approval is requested`}</Typography>
          <Box mt={1}>
            <Typography variant="body2">
              This purchase order requires your approval before Bespoke
              Financial can finance it. Please review the information and select
              either approve or reject.
            </Typography>
          </Box>
        </Box>
        {isMetrcBased && (
          <Box display="flex" flexDirection="column" mt={2}>
            <Typography variant="body2" color="textSecondary">
              Related manifest(s) from Metrc
            </Typography>
            {metrcTransfers.map((metrcTransfer) => (
              <Box
                key={metrcTransfer.id}
                display="flex"
                flexDirection="column"
                mt={1}
              >
                <MetrcTransferInfoCardForVendor metrcTransfer={metrcTransfer} />
              </Box>
            ))}
          </Box>
        )}
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
        {!isMetrcBased && (
          <Box display="flex" flexDirection="column" mt={2}>
            <Typography variant="subtitle2" color="textSecondary">
              Delivery Date
            </Typography>
            <Typography variant={"body1"}>
              {formatDateString(purchaseOrder.delivery_date)}
            </Typography>
          </Box>
        )}
        <Box display="flex" flexDirection="column" mt={2}>
          <Typography variant="subtitle2" color="textSecondary">
            Purchase Order File
          </Typography>
          <DownloadThumbnail
            fileIds={purchaseOrderFileIds}
            fileType={FileTypeEnum.PURCHASE_ORDER}
          />
        </Box>
        {!isMetrcBased && purchaseOrder.is_cannabis && (
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
        <Box display="flex" justifyContent="center" mt={6}>
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
              purchaseOrderId={purchaseOrder.id}
              linkVal={linkVal}
              handleClose={() => setIsRejectModalOpen(false)}
              handleRejectSuccess={() =>
                history.push({
                  pathname: anonymousRoutes.reviewPurchaseOrderComplete,
                })
              }
            />
          )}
          <Buttons>
            <StyledButton
              disabled={false}
              onClick={() => setIsRejectModalOpen(true)}
              variant={"outlined"}
              color={"default"}
            >
              Reject
            </StyledButton>
            <ButtonSpace />
            <StyledButton
              disabled={false}
              onClick={() => setIsApproveModalOpen(true)}
              variant={"contained"}
              color={"primary"}
            >
              Approve
            </StyledButton>
          </Buttons>
        </Box>
      </Box>
    </Box>
  );
}
