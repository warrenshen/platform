import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Typography,
} from "@material-ui/core";
import PurchaseOrderLoansDataGrid from "components/Loans/PurchaseOrderLoansDataGrid";
import RequestStatusChip from "components/Shared/Chip/RequestStatusChip";
import DownloadThumbnail from "components/Shared/File/DownloadThumbnail";
import FileViewer from "components/Shared/File/FileViewer";
import Modal from "components/Shared/Modal/Modal";
import MetrcTransferInfoCard from "components/Transfers/MetrcTransferInfoCard";
import {
  CurrentUserContext,
  isRoleBankUser,
} from "contexts/CurrentUserContext";
import {
  PurchaseOrderFileTypeEnum,
  PurchaseOrders,
  RequestStatusEnum,
  useGetPurchaseOrderForCustomerQuery,
} from "generated/graphql";
import { Action, check } from "lib/auth/rbac-rules";
import { getCompanyDisplayName } from "lib/companies";
import { formatCurrency } from "lib/currency";
import { formatDateString } from "lib/date";
import { FileTypeEnum } from "lib/enum";
import { useContext, useMemo, useState } from "react";

interface Props {
  purchaseOrderId: PurchaseOrders["id"];
  handleClose: () => void;
}

export default function PurchaseOrderDrawer({
  purchaseOrderId,
  handleClose,
}: Props) {
  const {
    user: { role },
  } = useContext(CurrentUserContext);
  const isBankUser = isRoleBankUser(role);

  const [isFileViewerOpen, setIsFileViewerOpen] = useState(false);

  const { data } = useGetPurchaseOrderForCustomerQuery({
    fetchPolicy: "network-only",
    variables: {
      id: purchaseOrderId,
    },
  });

  const purchaseOrder = data?.purchase_orders_by_pk;
  const loans = purchaseOrder?.loans;
  const purchaseOrderFileIds = useMemo(() => {
    return (
      purchaseOrder?.purchase_order_files
        .filter(
          (purchaseOrderFile) =>
            purchaseOrderFile.file_type ===
            PurchaseOrderFileTypeEnum.PurchaseOrder
        )
        .map((purchaseOrderFile) => purchaseOrderFile.file_id) || []
    );
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

  if (!purchaseOrder || !loans) {
    return null;
  }

  const isMetrcBased = !!purchaseOrder.is_metrc_based;

  return (
    <Modal
      title={"Purchase Order"}
      subtitle={purchaseOrder.order_number}
      contentWidth={800}
      handleClose={handleClose}
    >
      <Box display="flex" flexDirection="column" alignItems="flex-start" mt={2}>
        <Typography variant="subtitle2" color="textSecondary">
          Status
        </Typography>
        <RequestStatusChip requestStatus={purchaseOrder.status} />
      </Box>
      {purchaseOrder.status === RequestStatusEnum.Rejected && (
        <Box display="flex" flexDirection="column" mt={2}>
          <Typography variant="subtitle2" color="textSecondary">
            Rejection Reason
          </Typography>
          {!!purchaseOrder.rejection_note && (
            <Typography variant={"body1"}>
              {purchaseOrder.rejection_note}
            </Typography>
          )}
          {!!purchaseOrder.bank_rejection_note && (
            <Typography variant={"body1"}>
              {purchaseOrder.bank_rejection_note}
            </Typography>
          )}
        </Box>
      )}
      {isBankUser && (
        <Box display="flex" flexDirection="column" mt={2}>
          <Typography variant="subtitle2" color="textSecondary">
            Customer Name
          </Typography>
          <Typography variant={"body1"}>
            {purchaseOrder.company?.name}
          </Typography>
        </Box>
      )}
      <Box display="flex" flexDirection="column" mt={2}>
        <FormControlLabel
          control={<Checkbox disabled={true} checked={isMetrcBased} />}
          label={"Order based on Metrc manifest?"}
        />
      </Box>
      {isMetrcBased && (
        <Box display="flex" flexDirection="column" mt={2}>
          <Box>
            <Typography variant="body2" color="textSecondary">
              Metrc Manifest
            </Typography>
          </Box>
          {purchaseOrder.purchase_order_metrc_transfers.map(
            (purchaseOrderMetrcTransfer) => (
              <Box key={purchaseOrderMetrcTransfer.metrc_transfer_id} mt={2}>
                <MetrcTransferInfoCard
                  metrcTransferId={purchaseOrderMetrcTransfer.metrc_transfer.id}
                />
              </Box>
            )
          )}
        </Box>
      )}
      <Box display="flex" flexDirection="column" mt={2}>
        <Typography variant="subtitle2" color="textSecondary">
          Vendor
        </Typography>
        <Typography variant={"body1"}>
          {getCompanyDisplayName(purchaseOrder.vendor)}
        </Typography>
      </Box>
      <Box display="flex" flexDirection="column" mt={2}>
        <Typography variant="subtitle2" color="textSecondary">
          PO Number
        </Typography>
        <Typography variant={"body1"}>{purchaseOrder.order_number}</Typography>
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
          Amount (Amount Funded)
        </Typography>
        <Typography variant={"body1"}>
          {`${formatCurrency(purchaseOrder.amount)} (${formatCurrency(
            purchaseOrder.amount_funded || 0.0
          )} funded)`}
        </Typography>
      </Box>
      <Box display="flex" flexDirection="column" mt={2}>
        <Box mb={1}>
          <Typography variant="subtitle2" color="textSecondary">
            Purchase Order File Attachment(s)
          </Typography>
        </Box>
        <DownloadThumbnail
          fileIds={purchaseOrderFileIds}
          fileType={FileTypeEnum.PURCHASE_ORDER}
        />
      </Box>
      {!isMetrcBased && (
        <>
          <Box display="flex" flexDirection="column" mt={2}>
            <FormControlLabel
              control={
                <Checkbox
                  disabled={true}
                  checked={!!purchaseOrder.is_cannabis}
                />
              }
              label={"Order includes cannabis or derivatives?"}
            />
          </Box>
          {!!purchaseOrder.is_cannabis && (
            <Box display="flex" flexDirection="column" mt={2}>
              <Box mb={1}>
                <Typography variant="subtitle2" color="textSecondary">
                  Cannabis File Attachments
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Shipping Manifest, Certificate of Analysis
                </Typography>
              </Box>
              <DownloadThumbnail
                fileIds={purchaseOrderCannabisFileIds}
                fileType={FileTypeEnum.PURCHASE_ORDER}
              />
              <Button
                style={{ alignSelf: "flex-start" }}
                variant="outlined"
                size="small"
                onClick={() => setIsFileViewerOpen(!isFileViewerOpen)}
              >
                {isFileViewerOpen ? "Hide File(s)" : "Show File(s)"}
              </Button>
              {isFileViewerOpen && (
                <Box mt={1}>
                  <FileViewer
                    fileIds={purchaseOrderCannabisFileIds}
                    fileType={FileTypeEnum.PURCHASE_ORDER}
                  />
                </Box>
              )}
            </Box>
          )}
        </>
      )}
      <Box display="flex" flexDirection="column" mt={2}>
        <Typography variant="subtitle2" color="textSecondary">
          Comments
        </Typography>
        <Typography variant={"body1"}>
          {purchaseOrder.customer_note || "-"}
        </Typography>
      </Box>
      <Box display="flex" flexDirection="column" mt={2}>
        <Typography variant="subtitle2" color="textSecondary">
          Loans
        </Typography>
        <PurchaseOrderLoansDataGrid
          isMiniTable
          pager={false}
          loans={loans}
          isMultiSelectEnabled={check(role, Action.SelectLoan)}
          isViewNotesEnabled={check(role, Action.ViewLoanInternalNote)}
        />
      </Box>
      {isBankUser && (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="flex-start"
          mt={2}
        >
          <Typography variant="subtitle2" color="textSecondary">
            Platform ID
          </Typography>
          <Typography variant={"body1"}>{purchaseOrder.id}</Typography>
        </Box>
      )}
    </Modal>
  );
}
