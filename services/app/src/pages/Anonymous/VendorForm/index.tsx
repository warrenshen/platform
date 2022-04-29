import { useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import {
  Box,
  createStyles,
  makeStyles,
  Theme,
  Typography,
} from "@material-ui/core";
import { routes, anonymousRoutes } from "lib/routes";
import CreateVendorForm from "components/Vendors/CreateVendorForm";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import {
  Companies,
  useGetCompanyForVendorOnboardingQuery,
} from "generated/graphql";
import { createPartnershipRequestNewMutation } from "lib/api/companies";

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
  bankACHRoutingNumber: string;
  bankWireRoutingNumber: string;
  beneficiaryAddress: string;
  bankInstructionsAttachmentId: string;
  isCannabis: boolean;
  cannabisLicenseNumber: LicenseInfo;
  cannabisLicenseCopyAttachmentId: string;
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
    bankAccountNumber: "",
    bankACHRoutingNumber: "",
    bankWireRoutingNumber: "",
    beneficiaryAddress: "",
    bankInstructionsAttachmentId: "",
    isCannabis: false,
    cannabisLicenseNumber: { license_ids: [] },
    cannabisLicenseCopyAttachmentId: "",
  });

  const [errorMessage, setErrorMessage] = useState("");

  const { data, loading } = useGetCompanyForVendorOnboardingQuery({
    fetchPolicy: "network-only",
    variables: {
      id: companyId,
    },
  });

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
          bank_account_number: vendorInput.bankAccountNumber,
          bank_ach_routing_number: vendorInput.bankACHRoutingNumber,
          bank_wire_routing_number: vendorInput.bankWireRoutingNumber,
          beneficiary_address: vendorInput.beneficiaryAddress,
          bank_instructions_attachment_id:
            vendorInput.bankInstructionsAttachmentId,
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

  return (
    <Box className={classes.wrapper}>
      <Box mt={4}>
        <Typography variant="h5">Vendor Onboarding</Typography>
      </Box>
      <Box className={classes.container}>
        <CreateVendorForm
          companyId={companyId}
          companyName={companyName}
          vendorInput={vendorInput}
          setVendorInput={setVendorInput}
          errorMessage={errorMessage}
          isLoading={isCreateNewVendorPartnershipLoading}
          handleSubmit={handleSubmit}
        />
      </Box>
    </Box>
  );
}
