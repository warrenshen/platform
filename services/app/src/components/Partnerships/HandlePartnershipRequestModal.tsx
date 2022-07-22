import {
  Box,
  Checkbox,
  DialogContentText,
  Divider,
  FormControlLabel,
  Typography,
} from "@material-ui/core";
import AutocompleteCompany from "components/Shared/Company/AutocompleteCompany";
import Modal from "components/Shared/Modal/Modal";
import {
  Companies,
  GetPartnershipRequestsForBankSubscription,
} from "generated/graphql";
import useSnackbar from "hooks/useSnackbar";
import { createPartnershipMutation } from "lib/api/companies";
import { useState } from "react";

interface Props {
  partnerRequest: GetPartnershipRequestsForBankSubscription["company_partnership_requests"][0];
  handleClose: () => void;
}

export default function HandlePartnershipRequestModal({
  partnerRequest,
  handleClose,
}: Props) {
  const snackbar = useSnackbar();

  const [selectedCompanyId, setSelectedCompanyId] =
    useState<Companies["id"]>(null);

  const isSubmitDisabled =
    !partnerRequest?.user_info?.first_name && !selectedCompanyId ? true : false;

  const handleSubmit = async () => {
    const response = await createPartnershipMutation({
      variables: {
        partnership_request_id: partnerRequest.id,
        should_create_company: selectedCompanyId === null,
        partner_company_id: selectedCompanyId,
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
        <Typography variant={"body1"}>
          {partnerRequest.license_info
            ? partnerRequest.license_info.license_ids.join(", ")
            : "N/A"}
        </Typography>
      </Box>
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
