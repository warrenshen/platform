import { Box, Theme, createStyles, makeStyles } from "@material-ui/core";
import ReviewPurchaseOrderApproveModalNew from "components/PurchaseOrder/ReviewPurchaseOrderApproveModalNew";
import ReviewPurchaseOrderRejectModalNew from "components/PurchaseOrder/ReviewPurchaseOrderRejectModalNew";
import ReviewPurchaseOrderRequestChangesModal from "components/PurchaseOrder/ReviewPurchaseOrderRequestChangesModal";
import PrimaryButton from "components/Shared/Button/PrimaryButton";
import SecondaryButton from "components/Shared/Button/SecondaryButton";
import SecondaryWarningButton from "components/Shared/Button/SecondaryWarningButton";
import DownloadThumbnail from "components/Shared/File/DownloadThumbnail";
import ModalDataPoint from "components/Shared/Modal/ModalDataPoint";
import FlexContent from "components/Shared/Page/FlexContent";
import Text, { TextVariants } from "components/Shared/Text/Text";
import MetrcTransferInfoCardForVendor from "components/Transfers/MetrcTransferInfoCardForVendor";
import {
  Maybe,
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
import { useMemo, useState } from "react";
import { isMobile } from "react-device-detect";
import { useHistory } from "react-router-dom";
import styled from "styled-components";

const Buttons = styled(Box)<{
  $padding: Maybe<string>;
}>`
  display: flex;
  align-items: center;

  width: 100%;

  padding: ${(props) => (props.$padding ? props.$padding : "0")};
`;

const FixedBox = styled(Box)<{
  $height: number;
}>`
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: ${(props) => props.$height}px;
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
    <FlexContent>
      <Box className={classes.container}>
        {!isDataReady ? (
          <Box display="flex" flexDirection="column">
            {!!error ? (
              <Box display="flex" flexDirection="column" mt={2}>
                <Text textVariant={TextVariants.Paragraph}>
                  A network error occurred. Please check your network connection
                  and try again.
                </Text>
                <PrimaryButton
                  dataCy={"vendor-review-retry-data-load-button"}
                  text={"Retry"}
                  height={"40px"}
                  margin={"0"}
                  onClick={() => refetch()}
                />
              </Box>
            ) : (
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                mt={2}
              >
                <Text textVariant={TextVariants.Paragraph}>Loading...</Text>
              </Box>
            )}
          </Box>
        ) : !purchaseOrder || !!purchaseOrder.is_deleted ? (
          <Box display="flex" flexDirection="column">
            <Text textVariant={TextVariants.Paragraph}>
              Purchase order does not exist
            </Text>
          </Box>
        ) : (
          <>
            <Text
              alignment={"center"}
              materialVariant={"h1"}
              textVariant={
                isMobile ? TextVariants.ParagraphLead : TextVariants.Header
              }
            >
              {`Approval Request for PO ${purchaseOrder.order_number}`}
            </Text>
            <Text
              materialVariant={"p"}
              textVariant={
                isMobile ? TextVariants.Paragraph : TextVariants.ParagraphLead
              }
            >
              This purchase order new requires your approval before Bespoke
              Financial can finance it. Please review the information and select
              either approve, reject, or request changes.
            </Text>
            {isMetrcBased && (
              <Box display="flex" flexDirection="column" mt={2}>
                <Text
                  textVariant={TextVariants.Paragraph}
                  color="textSecondary"
                >
                  Related Metrc manifest
                </Text>
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
              {isMobile ? (
                <FixedBox display="flex" flexDirection="column" $height={140}>
                  <Buttons
                    mb={"16px"}
                    $padding={"0 10px"}
                    display="flex"
                    flexDirection="row"
                    justifyContent="space-between"
                  >
                    <SecondaryWarningButton
                      dataCy={"vendor-reject-completely-button"}
                      text={"Reject completely"}
                      margin={"0"}
                      padding={"11px 0"}
                      width={"48%"}
                      height={"40px"}
                      onClick={() => setIsRejectModalOpen(true)}
                    />
                    <SecondaryButton
                      dataCy={"vendor-requests-changes-button"}
                      text={"Request Changes"}
                      margin={"0"}
                      padding={"11px 0"}
                      width={"48%"}
                      height={"40px"}
                      onClick={() => setIsRequestChangesModalOpen(true)}
                    />
                  </Buttons>
                  <Buttons $padding={"0 10px"} justifyContent="center">
                    <PrimaryButton
                      dataCy={"vendor-approve-button"}
                      text={"Approve"}
                      margin={"0"}
                      padding={"11px 0"}
                      width={"100%"}
                      height={"40px"}
                      onClick={() => setIsApproveModalOpen(true)}
                    />
                  </Buttons>
                </FixedBox>
              ) : (
                <FixedBox display="flex" flexDirection="column" $height={86}>
                  <Buttons $padding={"0"} justifyContent="center">
                    <SecondaryWarningButton
                      dataCy={"vendor-reject-completely-button"}
                      text={"Reject completely"}
                      width={"288px"}
                      height={"40px"}
                      onClick={() => setIsRejectModalOpen(true)}
                    />
                    <SecondaryButton
                      dataCy={"vendor-requests-changes-button"}
                      text={"Request Changes"}
                      width={"288px"}
                      height={"40px"}
                      onClick={() => setIsRequestChangesModalOpen(true)}
                    />
                    <PrimaryButton
                      dataCy={"vendor-approve-button"}
                      text={"Approve"}
                      width={"288px"}
                      height={"40px"}
                      onClick={() => setIsApproveModalOpen(true)}
                    />
                  </Buttons>
                </FixedBox>
              )}
            </Box>
          </>
        )}
      </Box>
    </FlexContent>
  );
}
