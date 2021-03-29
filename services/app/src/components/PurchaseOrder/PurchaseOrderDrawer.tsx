import {
  Box,
  Checkbox,
  createStyles,
  Drawer,
  FormControlLabel,
  makeStyles,
  Theme,
  Typography,
} from "@material-ui/core";
import PurchaseOrderLoansDataGrid from "components/Loans/PurchaseOrderLoansDataGrid";
import RequestStatusChip from "components/Shared/Chip/RequestStatusChip";
import DownloadThumbnail from "components/Shared/File/DownloadThumbnail";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  PurchaseOrderFileTypeEnum,
  PurchaseOrders,
  RequestStatusEnum,
  usePurchaseOrderQuery,
  UserRolesEnum,
} from "generated/graphql";
import { Action, check } from "lib/auth/rbac-rules";
import { formatCurrency } from "lib/currency";
import { formatDateString } from "lib/date";
import { useContext, useMemo } from "react";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    drawerContent: {
      width: 500,
      paddingBottom: theme.spacing(16),
    },
    propertyLabel: {
      flexGrow: 1,
    },
  })
);

interface Props {
  purchaseOrderId: PurchaseOrders["id"];
  handleClose: () => void;
}

function PurchaseOrderDrawer({ purchaseOrderId, handleClose }: Props) {
  const classes = useStyles();
  const {
    user: { role },
  } = useContext(CurrentUserContext);

  const isBankUser = role === UserRolesEnum.BankAdmin;

  const { data } = usePurchaseOrderQuery({
    variables: {
      id: purchaseOrderId,
    },
  });

  const purchaseOrder = data?.purchase_orders_by_pk;
  const loans = purchaseOrder?.loans;
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

  return purchaseOrder && loans ? (
    <Drawer open anchor="right" onClose={handleClose}>
      <Box className={classes.drawerContent} p={4}>
        <Typography variant="h5">Purchase Order</Typography>
        <Box display="flex" flexDirection="column">
          <Box
            display="flex"
            flexDirection="column"
            alignItems="flex-start"
            mt={2}
          >
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
              <Typography variant={"body1"}>
                {purchaseOrder.rejection_note}
              </Typography>
            </Box>
          )}
          {isBankUser && (
            <Box display="flex" flexDirection="column" mt={2}>
              <Typography variant="subtitle2" color="textSecondary">
                Customer
              </Typography>
              <Typography variant={"body1"}>
                {purchaseOrder.company?.name}
              </Typography>
            </Box>
          )}
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
              PO Number
            </Typography>
            <Typography variant={"body1"}>
              {purchaseOrder.order_number}
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
              Amount
            </Typography>
            <Typography variant={"body1"}>
              {formatCurrency(purchaseOrder.amount)}
            </Typography>
          </Box>
          <Box display="flex" flexDirection="column" mt={2}>
            <Box mb={1}>
              <Typography variant="subtitle2" color="textSecondary">
                Purchase Order File Attachment
              </Typography>
            </Box>
            <DownloadThumbnail fileIds={purchaseOrderFileIds} />
          </Box>
          <Box display="flex" flexDirection="column" mt={2}>
            <FormControlLabel
              control={
                <Checkbox
                  disabled={true}
                  checked={!!purchaseOrder.is_cannabis}
                />
              }
              label={"Order includes cannabis or derivatives"}
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
              <DownloadThumbnail fileIds={purchaseOrderCannabisFileIds} />
            </Box>
          )}
        </Box>
        <Box display="flex" flexDirection="column" mt={2}>
          <Typography variant="subtitle2" color="textSecondary">
            Loans
          </Typography>
          <PurchaseOrderLoansDataGrid
            pager={false}
            isMiniTable
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
      </Box>
    </Drawer>
  ) : null;
}

export default PurchaseOrderDrawer;
