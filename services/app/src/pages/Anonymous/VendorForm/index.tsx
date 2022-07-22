import {
  Box,
  Button,
  Theme,
  Typography,
  createStyles,
  makeStyles,
} from "@material-ui/core";
import CreateUpdateVendorPartnershipRequestForm from "components/Vendors/CreateUpdateVendorPartnershipRequestForm";
import {
  Companies,
  useGetCompanyForVendorOnboardingQuery,
} from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { createPartnershipRequestNewMutation } from "lib/api/companies";
import { BankAccountType, PartnershipRequestType } from "lib/enum";
import { anonymousRoutes, routes } from "lib/routes";
import { isEmailValid } from "lib/validation";
import { useState } from "react";
import { useHistory, useParams } from "react-router-dom";

export type LicenseInfo = {
  license_ids: Array<string>;
};

export type CreateVendorInput = {
  name: string;
  dba: string;
  contactFirstName: string;
  contactLastName: string;
  contactPhone: string | null;
  contactEmail: string;
  bankName: string;
  bankAccountName: string;
  bankAccountNumber: string;
  bankAccountType: BankAccountType | string;
  bankACHRoutingNumber: string;
  bankWireRoutingNumber: string;
  beneficiaryAddress: string;
  bankInstructionsAttachmentId: string;
  isCannabis: boolean;
  cannabisLicenseNumber: LicenseInfo;
  cannabisLicenseCopyAttachmentId: string;
  selected_vendor_id?: string;
  selected_user_id?: string;
  selected_bank_account_id?: string;
};

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
      paddingTop: theme.spacing(8),
      paddingBottom: theme.spacing(8),
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2),
    },
    actionButtonWrapper: {
      display: "flex",
      justifyContent: "center",
    },
    actionButton: {
      width: 300,
    },
  })
);

export default function VendorFormPage() {
  const classes = useStyles();
  const snackbar = useSnackbar();
  const history = useHistory();

  const { companyId } = useParams<{
    companyId: Companies["id"];
  }>();

  const [
    createNewVendorPartnershipRequest,
    { loading: isCreateNewVendorPartnershipLoading },
  ] = useCustomMutation(createPartnershipRequestNewMutation);

  const [vendorInput, setVendorInput] = useState<CreateVendorInput>({
    name: "",
    dba: "",
    contactFirstName: "",
    contactLastName: "",
    contactPhone: "",
    contactEmail: "",
    bankName: "",
    bankAccountName: "",
    bankAccountType: BankAccountType.Checking,
    bankAccountNumber: "",
    bankACHRoutingNumber: "",
    bankWireRoutingNumber: "",
    beneficiaryAddress: "",
    bankInstructionsAttachmentId: "",
    isCannabis: false,
    cannabisLicenseNumber: { license_ids: [] },
    cannabisLicenseCopyAttachmentId: "",
    selected_vendor_id: "",
    selected_user_id: "",
    selected_bank_account_id: "",
  });

  const [errorMessage, setErrorMessage] = useState("");

  const { data, loading, error } = useGetCompanyForVendorOnboardingQuery({
    fetchPolicy: "network-only",
    variables: {
      id: companyId,
    },
  });

  if (error) {
    console.log({ error });
  }

  // Wait until we're done fetching the company details
  if (loading) {
    return (
      <Box className={classes.wrapper}>
        <Box className={classes.container}>
          <Box display="flex" flexDirection="column">
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              mt={2}
            >
              <Typography variant="h5">Loading...</Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    );
  }

  const company = data?.companies_by_pk || null;
  const companyName = company ? company.name : "";

  // Redirect to '/' if we are not able to fetch the company details from the uuid
  if (!companyName) {
    history.push({
      pathname: routes.root,
    });
  }

  const handleSubmit = async () => {
    const response = await createNewVendorPartnershipRequest({
      variables: {
        customer_id: companyId,
        company: {
          name: vendorInput.name,
          is_cannabis: vendorInput.isCannabis,
        },
        user: {
          first_name: vendorInput.contactFirstName,
          last_name: vendorInput.contactLastName,
          email: vendorInput.contactEmail,
          phone_number: vendorInput.contactPhone,
        },
        license_info: {
          license_ids: vendorInput.cannabisLicenseNumber.license_ids,
          license_file_id: vendorInput.cannabisLicenseCopyAttachmentId,
        },
        request_info: {
          dba_name: vendorInput.dba,
          bank_name: vendorInput.bankName,
          bank_account_name: vendorInput.bankAccountName,
          bank_account_type: vendorInput.bankAccountType,
          bank_account_number: vendorInput.bankAccountNumber,
          bank_ach_routing_number: vendorInput.bankACHRoutingNumber,
          bank_wire_routing_number: vendorInput.bankWireRoutingNumber,
          beneficiary_address: vendorInput.beneficiaryAddress,
          bank_instructions_attachment_id:
            vendorInput.bankInstructionsAttachmentId,
          type: PartnershipRequestType.VendorSubmitted,
        },
      },
    });

    if (response.status !== "OK") {
      setErrorMessage(response.msg);
      snackbar.showError(
        `Could not create partnership request. Reason: ${response.msg}`
      );
    } else {
      // Show thank you page on success
      history.push({
        pathname: anonymousRoutes.createVendorComplete,
      });
    }
  };

  const isSubmitDisabled =
    isCreateNewVendorPartnershipLoading ||
    !vendorInput.name ||
    !vendorInput.contactFirstName ||
    !vendorInput.contactLastName ||
    !vendorInput.contactPhone ||
    !vendorInput.contactEmail ||
    !isEmailValid(vendorInput.contactEmail) ||
    !vendorInput.bankName ||
    !vendorInput.bankAccountName ||
    !vendorInput.bankAccountType ||
    !vendorInput.bankAccountNumber ||
    !vendorInput.bankACHRoutingNumber ||
    !vendorInput.bankWireRoutingNumber ||
    !vendorInput.beneficiaryAddress ||
    !vendorInput.bankInstructionsAttachmentId ||
    (vendorInput.isCannabis &&
      !vendorInput.cannabisLicenseNumber.license_ids.length) ||
    // cannabisLicenseCopyAttachment is required only if the cannabisLicenseNumber exists
    (vendorInput.isCannabis &&
      vendorInput.cannabisLicenseNumber.license_ids[0] !== "N/A" &&
      !vendorInput.cannabisLicenseCopyAttachmentId);

  return (
    <Box className={classes.wrapper}>
      <Box mt={4}>
        <Typography variant="h5">Vendor Onboarding</Typography>
      </Box>
      <Box className={classes.container}>
        <CreateUpdateVendorPartnershipRequestForm
          companyId={companyId}
          companyName={companyName}
          vendorInput={vendorInput}
          setVendorInput={setVendorInput}
          isUpdate={false}
        />
        <Box className={classes.actionButtonWrapper} mt={4}>
          <Button
            className={classes.actionButton}
            disabled={isSubmitDisabled}
            variant="contained"
            color="primary"
            onClick={handleSubmit}
          >
            Submit
          </Button>

          {errorMessage && (
            <Typography variant="body2" color="secondary">
              {errorMessage}
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}
