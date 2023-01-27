import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  Theme,
  Typography,
  createStyles,
  makeStyles,
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import RegisterThirdPartyForm from "components/ThirdParties/RegisterThirdPartyForm";
import {
  CurrentUserContext,
  isRoleBankUser,
} from "contexts/CurrentUserContext";
import {
  Companies,
  CompaniesInsertInput,
  CompanyTypeEnum,
  UserRolesEnum,
  UsersInsertInput,
} from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import {
  LicenseInfo,
  createPartnershipRequestPayorMutation,
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

export default function AddPayorModal({ customerId, handleClose }: Props) {
  const classes = useStyles();
  const snackbar = useSnackbar();

  const {
    user: { role },
  } = useContext(CurrentUserContext);
  const isBankUser = isRoleBankUser(role);

  const [errorMessage, setErrorMessage] = useState("");

  const [payor, setPayor] = useState<CompaniesInsertInput>({
    name: "",
    is_cannabis: true,
    state: null,
    timezone: null,
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

  const [createPayorVendor, { loading: isCreatePayorVendorLoading }] =
    useCustomMutation(createPartnershipRequestPayorMutation);

  const handleRegisterClick = async () => {
    const response = await createPayorVendor({
      variables: {
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
    (!!payor.is_cannabis && licenseInfo.license_ids.length === 0);

  return (
    <Dialog
      open
      onClose={handleClose}
      maxWidth="md"
      classes={{ paper: classes.dialog }}
    >
      <DialogTitle>Add Payor</DialogTitle>
      {isBankUser && (
        <Box mt={2} mb={4} mx={3}>
          <Alert severity="warning">
            <Typography variant="body1">
              {`Warning: you are creating a payor partnership request on behalf of this
                customer (only bank admins can do this).`}
            </Typography>
          </Alert>
        </Box>
      )}
      <RegisterThirdPartyForm
        companyType={CompanyTypeEnum.Payor}
        role={role as UserRolesEnum}
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
