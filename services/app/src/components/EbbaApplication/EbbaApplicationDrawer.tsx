import { Box, Button, Typography } from "@material-ui/core";
import EbbaApplicationStatusChip from "components/EbbaApplication/EbbaApplicationStatusChip";
import ReviewEbbaApplicationRejectModal from "components/EbbaApplication/ReviewEbbaApplicationRejectModal";
import DownloadThumbnail from "components/Shared/File/DownloadThumbnail";
import FileViewer from "components/Shared/File/FileViewer";
import Modal from "components/Shared/Modal/Modal";
import ModalButton from "components/Shared/Modal/ModalButton";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  EbbaApplications,
  RequestStatusEnum,
  useGetEbbaApplicationQuery,
} from "generated/graphql";
import useSnackbar from "hooks/useSnackbar";
import { authenticatedApi, ebbaApplicationsRoutes } from "lib/api";
import { formatDateString, formatDatetimeString } from "lib/date";
import {
  CustomerSurveillanceCategoryEnum,
  FileTypeEnum,
  PlatformModeEnum,
} from "lib/enum";
import { formatCurrency } from "lib/number";
import { useContext, useMemo, useState } from "react";

interface Props {
  ebbaApplicationId: EbbaApplications["id"];
  handleClose: () => void;
}

export default function EbbaApplicationDrawer({
  ebbaApplicationId,
  handleClose,
}: Props) {
  const snackbar = useSnackbar();

  const {
    user: { platformMode },
  } = useContext(CurrentUserContext);

  const isBankUser = platformMode === PlatformModeEnum.Bank;

  const [isFileViewerOpen, setIsFileViewerOpen] = useState(false);

  const { data, refetch } = useGetEbbaApplicationQuery({
    variables: {
      id: ebbaApplicationId,
    },
  });

  const ebbaApplication = data?.ebba_applications_by_pk;

  const isBorrowingBase =
    ebbaApplication?.category ===
    CustomerSurveillanceCategoryEnum.BorrowingBase;
  const ebbaApplicationDisplayCategory = isBorrowingBase
    ? "Borrowing Base"
    : "Financial Report";

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
      snackbar.showError(
        `Could not approve certification. Message: ${response.data?.msg}`
      );
    } else {
      refetch();
      snackbar.showSuccess("Certification approved.");
    }
  };

  if (!ebbaApplication) {
    return null;
  }

  return (
    <Modal
      title={`${ebbaApplicationDisplayCategory} Certification`}
      contentWidth={700}
      handleClose={handleClose}
    >
      <Box display="flex" flexDirection="column">
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
        <Box
          display="flex"
          flexDirection="column"
          alignItems="flex-start"
          mt={2}
        >
          <Typography variant="subtitle2" color="textSecondary">
            Status
          </Typography>
          <EbbaApplicationStatusChip requestStatus={ebbaApplication.status} />
        </Box>
        {!!ebbaApplication.approved_at && (
          <Box display="flex" flexDirection="column" mt={2}>
            <Typography variant="subtitle2" color="textSecondary">
              Accepted At
            </Typography>
            <Typography variant={"body1"}>
              {formatDatetimeString(ebbaApplication.approved_at)}
            </Typography>
          </Box>
        )}
        {!!ebbaApplication.approved_at && ebbaApplication.approved_by_user && (
          <Box display="flex" flexDirection="column" mt={2}>
            <Typography variant="subtitle2" color="textSecondary">
              Approved By
            </Typography>
            <Typography variant={"body1"}>
              {ebbaApplication.approved_by_user.full_name}
            </Typography>
          </Box>
        )}
        {ebbaApplication.status === RequestStatusEnum.Rejected &&
          ebbaApplication.rejected_by_user && (
            <Box display="flex" flexDirection="column" mt={2}>
              <Typography variant="subtitle2" color="textSecondary">
                Rejected By
              </Typography>
              <Typography variant={"body1"}>
                {ebbaApplication.rejected_by_user.full_name}
              </Typography>
            </Box>
          )}
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
              Expiration Date
            </Typography>
            <Typography variant={"body1"}>
              {formatDateString(ebbaApplication.expires_date)}
            </Typography>
          </Box>
        )}
        <Box display="flex" flexDirection="column" mt={2}>
          <Typography variant="subtitle2" color="textSecondary">
            Certification Date
          </Typography>
          <Typography variant={"body1"}>
            {formatDateString(ebbaApplication.application_date)}
          </Typography>
        </Box>
        {isBorrowingBase && (
          <>
            <Box display="flex" flexDirection="column" mt={2}>
              <Typography variant="subtitle2" color="textSecondary">
                Calculated Borrowing Base
              </Typography>
              <Typography variant={"body1"}>
                {formatCurrency(ebbaApplication.calculated_borrowing_base)}
              </Typography>
            </Box>
            <Box display="flex" flexDirection="column" mt={2}>
              <Typography variant="subtitle2" color="textSecondary">
                Accounts Receivable Balance
              </Typography>
              <Typography variant={"body1"}>
                {formatCurrency(ebbaApplication.monthly_accounts_receivable)}
              </Typography>
            </Box>
            <Box display="flex" flexDirection="column" mt={2}>
              <Typography variant="subtitle2" color="textSecondary">
                Inventory Balance
              </Typography>
              <Typography variant={"body1"}>
                {formatCurrency(ebbaApplication.monthly_inventory)}
              </Typography>
            </Box>
            <Box display="flex" flexDirection="column" mt={2}>
              <Typography variant="subtitle2" color="textSecondary">
                Cash in Deposit Accounts
              </Typography>
              <Typography variant={"body1"}>
                {formatCurrency(ebbaApplication.monthly_cash)}
              </Typography>
            </Box>
            <Box display="flex" flexDirection="column" mt={2}>
              <Typography variant="subtitle2" color="textSecondary">
                Cash in DACA
              </Typography>
              <Typography variant={"body1"}>
                {formatCurrency(ebbaApplication.amount_cash_in_daca)}
              </Typography>
            </Box>
            {!!ebbaApplication.amount_custom && (
              <>
                <Box display="flex" flexDirection="column" mt={2}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Adjustment Amount
                  </Typography>
                  <Typography variant={"body1"}>
                    {formatCurrency(ebbaApplication.amount_custom)}
                  </Typography>
                </Box>
                <Box display="flex" flexDirection="column" mt={2}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Adjustment Note
                  </Typography>
                  <Typography variant={"body1"}>
                    {ebbaApplication.amount_custom_note}
                  </Typography>
                </Box>
              </>
            )}
          </>
        )}
        <Box display="flex" flexDirection="column" mt={2}>
          <Typography variant="subtitle2" color="textSecondary">
            File Attachments
          </Typography>
          <DownloadThumbnail
            fileIds={ebbaApplicationFileIds}
            fileType={FileTypeEnum.EbbaApplication}
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
                fileIds={ebbaApplicationFileIds}
                fileType={FileTypeEnum.EbbaApplication}
              />
            </Box>
          )}
        </Box>
        <Box display="flex" flexDirection="column" mt={2}>
          <Typography variant="subtitle2" color="textSecondary">
            Submitted By
          </Typography>
          <Typography variant={"body1"}>
            {ebbaApplication.submitted_by_user?.full_name || "-"}
          </Typography>
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
            <Typography variant={"body1"}>{ebbaApplication.id}</Typography>
          </Box>
        )}
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
            {ebbaApplication.status !== RequestStatusEnum.Approved && (
              <Box mt={1}>
                <Button
                  disabled={isApproveDisabled}
                  onClick={handleClickApprove}
                  variant={"contained"}
                  color={"primary"}
                >
                  Accept
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
    </Modal>
  );
}
