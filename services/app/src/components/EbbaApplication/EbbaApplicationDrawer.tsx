import {
  Box,
  Button,
  createStyles,
  Drawer,
  makeStyles,
  Theme,
  Typography,
} from "@material-ui/core";
import CreateUpdateEbbaApplicationModal from "components/EbbaApplication/CreateUpdateEbbaApplicationModal";
import ReviewEbbaApplicationRejectModal from "components/EbbaApplication/ReviewEbbaApplicationRejectModal";
import RequestStatusChip from "components/Shared/Chip/RequestStatusChip";
import DownloadThumbnail from "components/Shared/File/DownloadThumbnail";
import ModalButton from "components/Shared/Modal/ModalButton";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  EbbaApplications,
  RequestStatusEnum,
  useGetEbbaApplicationQuery,
  UserRolesEnum,
} from "generated/graphql";
import { authenticatedApi, ebbaApplicationsRoutes } from "lib/api";
import { formatCurrency } from "lib/currency";
import { ActionType } from "lib/enum";
import { useContext, useMemo } from "react";

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
  const {
    user: { role },
  } = useContext(CurrentUserContext);

  const isBankUser = role === UserRolesEnum.BankAdmin;

  const { data, refetch } = useGetEbbaApplicationQuery({
    variables: {
      id: ebbaApplicationId,
    },
  });

  const ebbaApplication = data?.ebba_applications_by_pk;
  const ebbaApplicationFileIds = useMemo(() => {
    return (
      ebbaApplication?.ebba_application_files.map(
        (ebbaApplicationFile) => ebbaApplicationFile.file_id
      ) || []
    );
  }, [ebbaApplication]);

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
            <RequestStatusChip requestStatus={ebbaApplication.status} />
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
          {isBankUser && (
            <Box display="flex" flexDirection="column" mt={2}>
              <Typography variant="subtitle2" color="textSecondary">
                Customer
              </Typography>
              <Typography variant={"body1"}>
                {ebbaApplication.company?.name}
              </Typography>
            </Box>
          )}
          <Box display="flex" flexDirection="column" mt={2}>
            <Typography variant="subtitle2" color="textSecondary">
              Application Date
            </Typography>
            <Typography variant={"body1"}>
              {ebbaApplication.application_date}
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
              Calculated Borrowing Base
            </Typography>
            <Typography variant={"body1"}>
              {ebbaApplication.calculated_borrowing_base
                ? formatCurrency(ebbaApplication.calculated_borrowing_base)
                : "TBD"}
            </Typography>
          </Box>
          <Box display="flex" flexDirection="column" mt={2}>
            <Typography variant="subtitle2" color="textSecondary">
              File Attachments
            </Typography>
            <DownloadThumbnail fileIds={ebbaApplicationFileIds} />
          </Box>
          {isBankUser && (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="flex-start"
              mt={2}
            >
              <Typography variant="subtitle2" color="textSecondary">
                Actions
              </Typography>
              {![
                RequestStatusEnum.Approved,
                RequestStatusEnum.Rejected,
              ].includes(ebbaApplication.status) && (
                <Box mt={1}>
                  <ModalButton
                    label={"Edit"}
                    color={"default"}
                    modal={({ handleClose }) => (
                      <CreateUpdateEbbaApplicationModal
                        actionType={ActionType.Update}
                        companyId={ebbaApplication.company_id}
                        ebbaApplicationId={ebbaApplication.id}
                        handleClose={() => {
                          refetch();
                          handleClose();
                        }}
                      />
                    )}
                  />
                </Box>
              )}
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
                  <ModalButton
                    isDisabled={isRejectDisabled}
                    label={"Reject"}
                    color={"default"}
                    modal={({ handleClose }) => (
                      <ReviewEbbaApplicationRejectModal
                        ebbaApplicationId={ebbaApplication.id}
                        handleClose={handleClose}
                        handleRejectSuccess={() => {
                          refetch();
                          handleClose();
                        }}
                      />
                    )}
                  />
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Box>
    </Drawer>
  ) : null;
}

export default EbbaApplicationDrawer;
