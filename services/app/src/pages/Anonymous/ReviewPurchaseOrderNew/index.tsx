import {
  Box,
  Button,
  Theme,
  Typography,
  createStyles,
  makeStyles,
} from "@material-ui/core";
import PrimaryButton from "components/Shared/Button/PrimaryButton";
import SecondaryButton from "components/Shared/Button/SecondaryButton";
import SecondaryWarningButton from "components/Shared/Button/SecondaryWarningButton";
import DownloadThumbnail from "components/Shared/File/DownloadThumbnail";
import ModalDataPoint from "components/Shared/Modal/ModalDataPoint";
import Text, { TextVariants } from "components/Shared/Text/Text";
import MetrcTransferInfoCardForVendor from "components/Transfers/MetrcTransferInfoCardForVendor";
import {
  PurchaseOrderFileTypeEnum,
  RequestStatusEnum,
  useGetPurchaseOrderForReviewQuery,
} from "generated/graphql";
import { getCompanyDisplayName } from "lib/companies";
import { formatDateString } from "lib/date";
import { FileTypeEnum } from "lib/enum";
import { formatCurrency } from "lib/number";
import { computePurchaseOrderDueDateDateStringClient } from "lib/purchaseOrders";
import { anonymousRoutes } from "lib/routes";
import ReviewPurchaseOrderRequestChangesModal from "pages/Anonymous/ReviewPurchaseOrderNew/ReviewPurchaseOrderRequestChangesModal";
import { useMemo, useState } from "react";
import { useHistory } from "react-router-dom";
import styled from "styled-components";

import ReviewPurchaseOrderApproveModalNew from "./ReviewPurchaseOrderApproveModalNew";
import ReviewPurchaseOrderRejectModalNew from "./ReviewPurchaseOrderRejectModalNew";

const Buttons = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  width: 100%;
`;

const StyledButton = styled(Button)`
  flex: 1;

  padding: 8px 0px;
`;

const FixedBox = styled(Box)`
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 96px;
  border-top: #d4d3d0 1px solid;
  padding: 23px 0;
  background: #fff;
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
      maxWidth: 600,
      paddingTop: "25px",
      paddingBottom: theme.spacing(8),
      paddingLeft: 0,
      paddingRight: 0,
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
  const [isRequestChangesModalOpen, setIsRequestChangesModalOpen] =
    useState(false);
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
            <Text textVariant={TextVariants.Header}>
              {`Approval Request for PO ${purchaseOrder.order_number}`}
            </Text>
            <Text textVariant={TextVariants.ParagraphLead}>
              This purchase order new requires your approval before Bespoke
              Financial can finance it. Please review the information and select
              either approve, reject, or request changes.
            </Text>
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
            <ModalDataPoint
              subtitle={"Buyer"}
              text={getCompanyDisplayName(purchaseOrder.company)}
            />
            <ModalDataPoint
              subtitle={"PO Number"}
              text={purchaseOrder.order_number}
            />
            <ModalDataPoint
              subtitle={"Amount"}
              text={formatCurrency(purchaseOrder.amount)}
            />
            <ModalDataPoint
              subtitle={"PO Date"}
              text={formatDateString(purchaseOrder.order_date)}
            />
            <ModalDataPoint
              subtitle={"Due Date"}
              text={computePurchaseOrderDueDateDateStringClient(purchaseOrder)}
            />
            <Box display="flex" flexDirection="column" mt={2}>
              <Text textVariant={TextVariants.Paragraph}>
                Purchase Order File
              </Text>
              <DownloadThumbnail
                fileIds={purchaseOrderFileIds}
                fileType={FileTypeEnum.PurchaseOrder}
              />
            </Box>
            {!isMetrcBased && purchaseOrder.is_cannabis && (
              <Box display="flex" flexDirection="column" mt={2}>
                <Text textVariant={TextVariants.Paragraph}>
                  Cannabis or Derivatives File(s)
                </Text>
                <DownloadThumbnail
                  fileIds={purchaseOrderCannabisFileIds}
                  fileType={FileTypeEnum.PurchaseOrder}
                />
              </Box>
            )}
            <Box display="flex" justifyContent="center" mt={6}>
              {isApproveModalOpen && (
                <ReviewPurchaseOrderApproveModalNew
                  purchaseOrder={purchaseOrder}
                  linkVal={linkVal}
                  handleClose={() => setIsApproveModalOpen(false)}
                  handleApproveSuccess={() => {
                    history.push({
                      pathname: anonymousRoutes.reviewPurchaseOrderComplete,
                      state: {
                        vendor_id: purchaseOrder.vendor_id,
                        link_val: linkVal,
                      },
                    });
                  }}
                />
              )}
              {isRequestChangesModalOpen && (
                <ReviewPurchaseOrderRequestChangesModal
                  purchaseOrderId={purchaseOrder.id}
                  linkVal={linkVal}
                  handleClose={() => setIsRequestChangesModalOpen(false)}
                  handleRequestChangesSuccess={() =>
                    history.push({
                      pathname: anonymousRoutes.reviewPurchaseOrderComplete,
                      state: {
                        vendor_id: purchaseOrder.vendor_id,
                        link_val: linkVal,
                      },
                    })
                  }
                />
              )}
              {isRejectModalOpen && (
                <ReviewPurchaseOrderRejectModalNew
                  purchaseOrderId={purchaseOrder.id}
                  linkVal={linkVal}
                  handleClose={() => setIsRejectModalOpen(false)}
                  handleRejectSuccess={() =>
                    history.push({
                      pathname: anonymousRoutes.reviewPurchaseOrderComplete,
                      state: {
                        vendor_id: purchaseOrder.vendor_id,
                        link_val: linkVal,
                      },
                    })
                  }
                />
              )}
              <FixedBox>
                <Buttons>
                  <SecondaryWarningButton
                    text={"Reject completely"}
                    width={"288px"}
                    height={"50px"}
                    onClick={() => setIsRejectModalOpen(true)}
                  />
                  <SecondaryButton
                    text={"Request Changes"}
                    width={"288px"}
                    height={"50px"}
                    onClick={() => setIsRequestChangesModalOpen(true)}
                  />
                  <PrimaryButton
                    text={"Approve"}
                    width={"288px"}
                    height={"50px"}
                    onClick={() => setIsApproveModalOpen(true)}
                  />
                </Buttons>
              </FixedBox>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
}
