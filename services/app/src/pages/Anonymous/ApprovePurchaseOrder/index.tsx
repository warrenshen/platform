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
import { authenticatedApi, purchaseOrdersRoutes } from "lib/api";
import { anonymousRoutes } from "lib/routes";
import { useState } from "react";
import { useHistory } from "react-router-dom";
import RejectApprovalRequestModal from "./RejectApprovalRequestModal";

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

function ApprovePurchaseOrder(props: Props) {
  const classes = useStyles();
  const location: any = props.location;

  const payload = location.state?.payload;
  const purchaseOrderId = payload?.purchase_order_id;

  const history = useHistory();
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  const { data } = usePurchaseOrderForReviewQuery({
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

  const handleClickApprove = async () => {
    const response = await authenticatedApi.post(
      purchaseOrdersRoutes.respondToApprovalRequest,
      {
        purchase_order_id: purchaseOrder?.id,
        new_request_status: RequestStatusEnum.Approved,
        rejection_note: "",
      }
    );
    if (response.data?.status === "ERROR") {
      alert(response.data?.msg);
    } else {
      history.push({
        pathname: anonymousRoutes.confirmPurchaseOrderComplete,
      });
    }
  };

  const handleClickReject = () => {
    setIsRejectModalOpen(true);
  };

  return location.state ? (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      justifyContent="center"
      alignItems="center"
    >
      <Box width="400px" display="flex" flexDirection="column">
        <Box display="flex" flexDirection="column">
          <Box>
            <h2>Your approval is requested</h2>
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
            <p>{purchaseOrder?.order_number}</p>
          </Box>
          <Box display="flex" flexDirection="row" m={1}>
            <p className={classes.propertyLabel}>
              <strong>Amount:</strong>
            </p>
            <p>{purchaseOrder?.amount}</p>
          </Box>
          <Box display="flex" flexDirection="row" m={1}>
            <p className={classes.propertyLabel}>
              <strong>Order Date:</strong>
            </p>
            <p>{purchaseOrder?.order_date}</p>
          </Box>
          <Box display="flex" flexDirection="row" m={1}>
            <p className={classes.propertyLabel}>
              <strong>Debtor:</strong>
            </p>
            <p>{purchaseOrder?.company?.name}</p>
          </Box>
        </Box>
        <Box flexDirection="column" flexGrow={1}>
          <Box display="flex" flexDirection="row" m={1}>
            <p className={classes.propertyLabel}>
              <strong>Status</strong>
            </p>
            <p>{purchaseOrder?.status}</p>
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
            onClick={handleClickReject}
            variant={"contained"}
            color={"secondary"}
          >
            Reject
          </Button>
          <Button
            disabled={false}
            onClick={handleClickApprove}
            variant={"contained"}
            color={"primary"}
          >
            Approve
          </Button>
          {isRejectModalOpen && (
            <RejectApprovalRequestModal
              purchaseOrderId={purchaseOrder?.id}
              handleClose={() => setIsRejectModalOpen(false)}
              handleRejectSuccess={() =>
                history.push({
                  pathname: anonymousRoutes.confirmPurchaseOrderComplete,
                })
              }
            ></RejectApprovalRequestModal>
          )}
        </Box>
      </Box>
    </Box>
  ) : null;
}

export default ApprovePurchaseOrder;
