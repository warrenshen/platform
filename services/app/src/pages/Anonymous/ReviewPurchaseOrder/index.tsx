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
import { getCompanyDisplayName } from "lib/companies";
import { formatCurrency } from "lib/number";
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
    error,
    refetch,
  } = useGetPurchaseOrderForReviewQuery({
    fetchPolicy: "network-only",
    variables: {
      id: purchaseOrderId,
    },
  });

  if (error) {
    console.error({ error });
  }

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

  const isMetrcBased = !!purchaseOrder?.is_metrc_based;
  const metrcTransfers =
    purchaseOrder?.purchase_order_metrc_transfers.map(
      (purchaseOrderMetrcTransfer) => purchaseOrderMetrcTransfer.metrc_transfer
    ) || [];

  const isDataReady = !isPurchaseOrderLoading && !error;

  return (
    <Box className={classes.wrapper}>
      <Box className={classes.container}>
        {!isDataReady ? (
          <Box display="flex" flexDirection="column">
            {!!error ? (
              <>
                <Typography variant="h5">
                  A network error occurred. Please check your network connection
                  and try again.
                </Typography>
                <Box display="flex" flexDirection="column" mt={2}>
                  <StyledButton
                    variant={"contained"}
                    color={"primary"}
                    onClick={() => refetch()}
                  >
                    Retry
                  </StyledButton>
                </Box>
              </>
            ) : (
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                mt={2}
              >
                <Typography variant="h5">Loading...</Typography>
              </Box>
            )}
          </Box>
        ) : !purchaseOrder || !!purchaseOrder.is_deleted ? (
          <Box display="flex" flexDirection="column">
            <Typography variant="h5">Purchase order does not exist</Typography>
          </Box>
        ) : (
          <>
            <Box display="flex" flexDirection="column">
              <Typography variant="h5">{`Approval requested for PO ${purchaseOrder.order_number}`}</Typography>
              <Box mt={1}>
                <Typography variant="body2">
                  This purchase order requires your approval before Bespoke
                  Financial can finance it. Please review the information and
                  select either approve or reject.
                </Typography>
              </Box>
            </Box>
            {isMetrcBased && (
              <Box display="flex" flexDirection="column" mt={2}>
                <Typography variant="body2" color="textSecondary">
                  Related Metrc manifest
                </Typography>
                {metrcTransfers.map((metrcTransfer) => (
                  <Box
                    key={metrcTransfer.id}
                    display="flex"
                    flexDirection="column"
                    mt={1}
                  >
                    <MetrcTransferInfoCardForVendor
                      metrcTransfer={metrcTransfer}
                    />
                  </Box>
                ))}
              </Box>
            )}
            <Box display="flex" flexDirection="column" mt={2}>
              <Typography variant="subtitle2" color="textSecondary">
                Buyer
              </Typography>
              <Typography variant={"body1"}>
                {getCompanyDisplayName(purchaseOrder.company)}
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
                  variant={"outlined"}
                  color={"default"}
                  onClick={() => setIsRejectModalOpen(true)}
                >
                  Reject
                </StyledButton>
                <ButtonSpace />
                <StyledButton
                  disabled={false}
                  variant={"contained"}
                  color={"primary"}
                  onClick={() => setIsApproveModalOpen(true)}
                >
                  Approve
                </StyledButton>
              </Buttons>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
}
