import {
  Box,
  Button,
  Checkbox,
  DialogContentText,
  Divider,
  FormControlLabel,
  TextField,
  Typography,
} from "@material-ui/core";
import BankAccountInfoCard from "components/BankAccount/BankAccountInfoCard";
import AutocompleteCompany from "components/Shared/Company/AutocompleteCompany";
import DownloadThumbnail from "components/Shared/File/DownloadThumbnail";
import FileViewer from "components/Shared/File/FileViewer";
import Modal from "components/Shared/Modal/Modal";
import {
  BankAccounts,
  Companies,
  GetPartnershipRequestsForBankSubscription,
} from "generated/graphql";
import useSnackbar from "hooks/useSnackbar";
import { createPartnershipNewMutation } from "lib/api/companies";
import { FileTypeEnum } from "lib/enum";
import { useState } from "react";

interface Props {
  partnerRequest: GetPartnershipRequestsForBankSubscription["company_partnership_requests"][0];
  handleClose: () => void;
}

export type LicenseInfo = {
  license_ids: Array<string>;
};

export default function HandlePartnershipRequestNewModal({
  partnerRequest,
  handleClose,
}: Props) {
  const snackbar = useSnackbar();

  const isSubmitDisabled = false;
  const [selectedCompanyId, setSelectedCompanyId] =
    useState<Companies["id"]>(null);

  const [licenseIds, setlicenseIds] = useState<LicenseInfo>({
    license_ids: partnerRequest.license_info
      ? partnerRequest.license_info.license_ids
      : [],
  });

  const [isCompanyLicenseFileViewerOpen, setIsCompanyLicenseFileViewerOpen] =
    useState(false);

  const [
    isBankInstructionsFileViewerOpen,
    setIsBankInstructionsFileViewerOpen,
  ] = useState(false);

  const handleSubmit = async () => {
    const response = await createPartnershipNewMutation({
      variables: {
        partnership_request_id: partnerRequest.id,
        should_create_company: selectedCompanyId === null,
        partner_company_id: selectedCompanyId,
        license_info: licenseIds,
      },
    });
    if (response.status !== "OK") {
      snackbar.showError(
        `Could not create partnership. Reason: ${response.msg}`
      );
    } else {
      snackbar.showSuccess(
        "Partnership created and email sent to the customer and partner"
      );
      handleClose();
    }
  };

  const bankDetails = {
    bank_name: partnerRequest.request_info?.bank_name,
    account_title: partnerRequest.request_info?.bank_account_name,
    account_number: partnerRequest.request_info?.bank_account_number,
    bank_instructions_file_id:
      partnerRequest.request_info?.bank_instructions_attachment_id,
    can_ach: partnerRequest.request_info?.bank_ach_routing_number
      ? true
      : false,
    routing_number: partnerRequest.request_info?.bank_ach_routing_number,
    can_wire: partnerRequest.request_info?.bank_wire_routing_number
      ? true
      : false,
    wire_routing_number: partnerRequest.request_info?.bank_wire_routing_number,
    recipient_address: partnerRequest.request_info?.beneficiary_address,
  };

  return (
    <Modal
      dataCy={"triage-partnership-request-modal"}
      isPrimaryActionDisabled={isSubmitDisabled}
      title={"Triage Partnership Request"}
      primaryActionText={"Submit"}
      contentWidth={600}
      handleClose={handleClose}
      handlePrimaryAction={handleSubmit}
    >
      <DialogContentText>
        Please review the following partnership request. A customer requests to
        partner with a payor / vendor. If the payor / vendor company already
        exists, please specify this below so a duplicate company is not created.
      </DialogContentText>
      <Box display="flex" flexDirection="column" mt={4}>
        <Typography variant="subtitle2" color="textSecondary">
          Requesting Company (Customer)
        </Typography>
        <Typography variant={"body1"}>
          {partnerRequest.requesting_company.name}
        </Typography>
      </Box>
      <Box mb={4} mt={4}>
        <Divider />
      </Box>

      <Box display="flex" flexDirection="column" mt={4}>
        <Typography variant="subtitle2" color="textSecondary">
          Partner Company Type
        </Typography>
        <Typography variant={"body1"}>{partnerRequest.company_type}</Typography>
      </Box>
      <Box display="flex" flexDirection="column" mt={4}>
        <Typography variant="subtitle2" color="textSecondary">
          Partner Company Name
        </Typography>
        <Typography variant={"body1"}>{partnerRequest.company_name}</Typography>
      </Box>
      <Box display="flex" flexDirection="column" mt={4}>
        <FormControlLabel
          control={
            <Checkbox disabled={true} checked={!!partnerRequest.is_cannabis} />
          }
          label={"Is this company a cannabis company?"}
        />
      </Box>
      <Box display="flex" flexDirection="column" mt={4}>
        <Typography variant="subtitle2" color="textSecondary">
          Partner Company License IDs
        </Typography>
        <TextField
          value={licenseIds.license_ids.join(",")}
          onChange={({ target: { value } }) => {
            let licenseIds = value.split(",").map((l) => {
              return l.trim();
            });
            setlicenseIds({
              license_ids: licenseIds,
            });
          }}
        />
      </Box>

      {partnerRequest.license_info?.license_file_id && (
        <Box display="flex" flexDirection="column" mt={4}>
          <Typography variant="subtitle2" color="textSecondary">
            Company License File Attachment
          </Typography>
          <DownloadThumbnail
            fileIds={[partnerRequest.license_info.license_file_id]}
            fileType={FileTypeEnum.CompanyLicense}
          />
          <Button
            style={{ alignSelf: "flex-start" }}
            variant="outlined"
            size="small"
            onClick={() =>
              setIsCompanyLicenseFileViewerOpen(!isCompanyLicenseFileViewerOpen)
            }
          >
            {isCompanyLicenseFileViewerOpen ? "Hide File(s)" : "Show File(s)"}
          </Button>
          {isCompanyLicenseFileViewerOpen && (
            <Box mt={1}>
              <FileViewer
                fileIds={[partnerRequest.license_info.license_file_id]}
                fileType={FileTypeEnum.CompanyLicense}
              />
            </Box>
          )}
        </Box>
      )}

      <Box mb={4} mt={4}>
        <Divider />
      </Box>

      <Box display="flex" flexDirection="column" mt={4}>
        <Typography variant="subtitle2" color="textSecondary">
          DBA
        </Typography>
        <Typography variant={"body1"}>
          {partnerRequest.request_info?.dba_name}
        </Typography>
      </Box>

      <Box display="flex" flexDirection="column" mt={4}>
        <Typography variant="subtitle2" color="textSecondary">
          Recipient Bank Information
        </Typography>
        <Box mt={1}>
          <BankAccountInfoCard bankAccount={bankDetails as BankAccounts} />
        </Box>
      </Box>

      {partnerRequest.request_info?.bank_instructions_attachment_id && (
        <Box display="flex" flexDirection="column" mt={4}>
          <Typography variant="subtitle2" color="textSecondary">
            Bank Instructions or Canceled Check File Attachment
          </Typography>
          <DownloadThumbnail
            fileIds={[
              partnerRequest.request_info.bank_instructions_attachment_id,
            ]}
            fileType={FileTypeEnum.CompanyLicense}
          />
          <Button
            style={{ alignSelf: "flex-start" }}
            variant="outlined"
            size="small"
            onClick={() =>
              setIsBankInstructionsFileViewerOpen(
                !isBankInstructionsFileViewerOpen
              )
            }
          >
            {isBankInstructionsFileViewerOpen ? "Hide File(s)" : "Show File(s)"}
          </Button>
          {isBankInstructionsFileViewerOpen && (
            <Box mt={1}>
              <FileViewer
                fileIds={[
                  partnerRequest.request_info.bank_instructions_attachment_id,
                ]}
                fileType={FileTypeEnum.CompanyLicense}
              />
            </Box>
          )}
        </Box>
      )}

      <Box mb={4} mt={4}>
        <Divider />
      </Box>

      <Box display="flex" flexDirection="column">
        <Typography variant="subtitle2" color="textSecondary">
          Partner Company Primary Contact Info
        </Typography>
        <Typography variant={"body1"}>
          {partnerRequest.user_info
            ? `${partnerRequest.user_info.first_name} ${partnerRequest.user_info.last_name}`
            : ""}
        </Typography>
        <Typography variant={"body1"}>
          {partnerRequest.user_info ? `${partnerRequest.user_info.email}` : ""}
        </Typography>
        <Typography variant={"body1"}>
          {partnerRequest.user_info
            ? `${partnerRequest.user_info.phone_number}`
            : ""}
        </Typography>
      </Box>

      <Box mb={4} mt={4}>
        <Divider />
      </Box>

      <Box display="flex" flexDirection="column">
        <Typography variant={"body1"}>
          Does the partner company above ALREADY exist in the system? If yes,
          please select this existing company in the dropdown below. If you do
          not select a company below, a NEW company will be created.
        </Typography>
        <Box mt={4}>
          <AutocompleteCompany
            textFieldLabel="Select existing company (search by name or license)"
            onChange={(selectedCompanyId) =>
              setSelectedCompanyId(selectedCompanyId)
            }
          />
        </Box>
      </Box>
    </Modal>
  );
}
