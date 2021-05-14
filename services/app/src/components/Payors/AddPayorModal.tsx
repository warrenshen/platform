import {
  Box,
  Button,
  createStyles,
  Dialog,
  DialogActions,
  DialogTitle,
  makeStyles,
  Theme,
} from "@material-ui/core";
import RegisterThirdPartyForm from "components/ThirdParties/RegisterThirdPartyForm";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  Companies,
  CompaniesInsertInput,
  CompanyTypeEnum,
  UsersInsertInput,
} from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import {
  createPartnershipRequestMutation,
  LicenseInfo,
} from "lib/api/companies";
import { useContext, useState } from "react";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    dialog: {
      width: 500,
    },
    dialogActions: {
      margin: theme.spacing(2),
    },
  })
);

interface Props {
  customerId: Companies["id"];
  handleClose: () => void;
}

function AddPayorModal({ customerId, handleClose }: Props) {
  const classes = useStyles();
  const snackbar = useSnackbar();

  const {
    user: { role },
  } = useContext(CurrentUserContext);

  const [errorMessage, setErrorMessage] = useState("");

  const [payor, setPayor] = useState<CompaniesInsertInput>({
    name: "",
    is_cannabis: true,
  });
  const [contact, setContact] = useState<UsersInsertInput>({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
  });
  const [licenseInfo, setLicenseInfo] = useState<LicenseInfo>({
    license_ids: [],
  });

  const [
    createPayorVendor,
    { loading: isCreatePayorVendorLoading },
  ] = useCustomMutation(createPartnershipRequestMutation);

  const handleRegisterClick = async () => {
    const response = await createPayorVendor({
      variables: {
        is_payor: true,
        customer_id: customerId,
        company: payor,
        user: contact,
        license_info: licenseInfo,
      },
    });

    if (response.status !== "OK") {
      setErrorMessage(response.msg);
      snackbar.showError(
        `Could not create payor request. Reason: ${response.msg}`
      );
    } else {
      snackbar.showSuccess(
        "Payor request created and Bespoke support staff have been notified"
      );
      handleClose();
    }
  };

  const isSubmitDisabled =
    !payor.name ||
    !contact.first_name ||
    !contact.last_name ||
    !contact.email ||
    !contact.phone_number ||
    isCreatePayorVendorLoading ||
    licenseInfo.license_ids.length === 0;

  return (
    <Dialog
      open
      onClose={handleClose}
      maxWidth="md"
      classes={{ paper: classes.dialog }}
    >
      <DialogTitle>Add Payor</DialogTitle>
      <RegisterThirdPartyForm
        companyType={CompanyTypeEnum.Payor}
        role={role}
        contact={contact}
        setContact={setContact}
        company={payor}
        setCompany={setPayor}
        errorMessage={errorMessage}
        licenseInfo={licenseInfo}
        setLicenseInfo={setLicenseInfo}
      />
      <DialogActions className={classes.dialogActions}>
        <Box display="flex">
          <Box mr={2}>
            <Button onClick={handleClose}>Cancel</Button>
          </Box>
          <Button
            disabled={isSubmitDisabled}
            variant="contained"
            color="primary"
            onClick={handleRegisterClick}
          >
            Submit
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}

export default AddPayorModal;
