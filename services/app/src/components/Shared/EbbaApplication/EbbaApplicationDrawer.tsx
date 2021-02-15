import {
  Box,
  Button,
  createStyles,
  Drawer,
  makeStyles,
  Theme,
  Typography,
} from "@material-ui/core";
import RequestStatusChip from "components/Shared/Chip/RequestStatusChip";
import DownloadThumbnail from "components/Shared/File/DownloadThumbnail";
import {
  EbbaApplications,
  RequestStatusEnum,
  useEbbaApplicationQuery,
} from "generated/graphql";
import { authenticatedApi, ebbaApplicationsRoutes } from "lib/api";
import { formatCurrency } from "lib/currency";
import { useState } from "react";
import ReviewEbbaApplicationRejectModal from "./ReviewEbbaApplicationRejectModal";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    drawerContent: {
      width: 400,
      paddingBottom: theme.spacing(16),
    },
  })
);

interface Props {
  ebbaApplicationId: EbbaApplications["id"];
  handleClose: () => void;
}

function EbbaApplicationDrawer({ ebbaApplicationId, handleClose }: Props) {
  const classes = useStyles();

  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  const { data, refetch } = useEbbaApplicationQuery({
    variables: {
      id: ebbaApplicationId,
    },
  });

  const ebbaApplication = data?.ebba_applications_by_pk;
  const ebbaApplicationFiles = ebbaApplication?.ebba_application_files || [];

  const isApproveDisabled = false;
  const isRejectDisabled = false;

  const handleClickApprove = async () => {
    const params = {
      ebba_application_id: ebbaApplication?.id,
      new_request_status: RequestStatusEnum.Approved,
      rejection_note: "",
    };
    const response = await authenticatedApi.post(
      ebbaApplicationsRoutes.respondToApprovalRequest,
      params
    );
    if (response.data?.status === "ERROR") {
      alert(response.data?.msg);
    } else {
      refetch();
    }
  };

  return ebbaApplication ? (
    <Drawer open anchor="right" onClose={handleClose}>
      {isRejectModalOpen && (
        <ReviewEbbaApplicationRejectModal
          ebbaApplicationId={ebbaApplication.id}
          handleClose={() => setIsRejectModalOpen(false)}
          handleRejectSuccess={() => {
            refetch();
            setIsRejectModalOpen(false);
          }}
        ></ReviewEbbaApplicationRejectModal>
      )}
      <Box className={classes.drawerContent} p={4}>
        <Typography variant="h5">Borrowing Base</Typography>
        <Box display="flex" flexDirection="column">
          <Box
            display="flex"
            flexDirection="column"
            alignItems="flex-start"
            mt={2}
          >
            <Typography variant="subtitle2" color="textSecondary">
              Platform ID
            </Typography>
            <Typography variant={"body1"}>{ebbaApplication.id}</Typography>
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
              requestStatus={ebbaApplication.status}
            ></RequestStatusChip>
          </Box>
          {ebbaApplication.status === RequestStatusEnum.Rejected && (
            <Box display="flex" flexDirection="column" mt={2}>
              <Typography variant="subtitle2" color="textSecondary">
                Rejection Reason
              </Typography>
              <Typography variant={"body1"}>
                {ebbaApplication.rejection_note}
              </Typography>
            </Box>
          )}
          <Box display="flex" flexDirection="column" mt={2}>
            <Typography variant="subtitle2" color="textSecondary">
              Company
            </Typography>
            <Typography variant={"body1"}>
              {ebbaApplication.company?.name}
            </Typography>
          </Box>
          <Box display="flex" flexDirection="column" mt={2}>
            <Typography variant="subtitle2" color="textSecondary">
              Application Month
            </Typography>
            <Typography variant={"body1"}>
              {ebbaApplication.application_month}
            </Typography>
          </Box>
          <Box display="flex" flexDirection="column" mt={2}>
            <Typography variant="subtitle2" color="textSecondary">
              Montly Accounts Receivable
            </Typography>
            <Typography variant={"body1"}>
              {formatCurrency(ebbaApplication.monthly_accounts_receivable)}
            </Typography>
          </Box>
          <Box display="flex" flexDirection="column" mt={2}>
            <Typography variant="subtitle2" color="textSecondary">
              Monthly Inventory
            </Typography>
            <Typography variant={"body1"}>
              {formatCurrency(ebbaApplication.monthly_inventory)}
            </Typography>
          </Box>
          <Box display="flex" flexDirection="column" mt={2}>
            <Typography variant="subtitle2" color="textSecondary">
              Monthly Cash
            </Typography>
            <Typography variant={"body1"}>
              {formatCurrency(ebbaApplication.monthly_cash)}
            </Typography>
          </Box>
          <Box display="flex" flexDirection="column" mt={2}>
            <Typography variant="subtitle2" color="textSecondary">
              File Attachments
            </Typography>
            {ebbaApplicationFiles.length > 0 && (
              <DownloadThumbnail
                fileIds={ebbaApplicationFiles.map(
                  (ebbaApplicationFile) => ebbaApplicationFile.file_id
                )}
              ></DownloadThumbnail>
            )}
          </Box>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="flex-start"
            mt={2}
          >
            <Typography variant="subtitle2" color="textSecondary">
              Actions
            </Typography>
            {ebbaApplication.status !== RequestStatusEnum.Approved && (
              <Box mt={1}>
                <Button
                  disabled={isApproveDisabled}
                  onClick={handleClickApprove}
                  variant={"contained"}
                  color={"primary"}
                >
                  Approve
                </Button>
              </Box>
            )}
            {ebbaApplication.status !== RequestStatusEnum.Rejected && (
              <Box mt={1}>
                <Button
                  disabled={isRejectDisabled}
                  onClick={() => setIsRejectModalOpen(true)}
                  variant={"contained"}
                  color={"secondary"}
                >
                  Reject
                </Button>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Drawer>
  ) : null;
}

export default EbbaApplicationDrawer;
