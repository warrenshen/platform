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
import { createPayorVendorMutation } from "lib/api/companies";
import { useContext, useState } from "react";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    dialog: {
      width: 500,
    },
  })
);

interface Props {
  customerId: Companies["id"];
  handleClose: () => void;
}

function AddVendorModal({ customerId, handleClose }: Props) {
  const classes = useStyles();
  const snackbar = useSnackbar();

  const {
    user: { role },
  } = useContext(CurrentUserContext);

  const [errorMessage, setErrorMessage] = useState("");

  const [vendor, setVendor] = useState<CompaniesInsertInput>({ name: "" });
  const [contact, setContact] = useState<UsersInsertInput>({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
  });

  const [
    createPayorVendor,
    { loading: isCreatePayorVendorLoading },
  ] = useCustomMutation(createPayorVendorMutation);

  const handleRegisterClick = async () => {
    const response = await createPayorVendor({
      variables: {
        is_payor: false,
        customer_id: customerId,
        company: vendor,
        user: contact,
      },
    });

    if (response.status !== "OK") {
      setErrorMessage(response.msg);
      snackbar.showError(
        `Error! Could not create partner company. Reason: ${response.msg}`
      );
    } else {
      snackbar.showSuccess(
        "Success! Partner company created and user sent a welcome email."
      );
      handleClose();
    }
  };

  const isSubmitDisabled =
    !vendor.name ||
    !contact.first_name ||
    !contact.last_name ||
    !contact.email ||
    !contact.phone_number ||
    isCreatePayorVendorLoading;

  return (
    <Dialog
      open
      onClose={handleClose}
      maxWidth="md"
      classes={{ paper: classes.dialog }}
    >
      <DialogTitle>Add Vendor</DialogTitle>
      <RegisterThirdPartyForm
        companyType={CompanyTypeEnum.Vendor}
        role={role}
        contact={contact}
        setContact={setContact}
        company={vendor}
        setCompany={setVendor}
        errorMessage={errorMessage}
      />
      <DialogActions>
        <Box display="flex">
          <Box pr={1}>
            <Button onClick={handleClose}>Cancel</Button>
          </Box>
          <Button
            disabled={isSubmitDisabled}
            variant="contained"
            color="primary"
            onClick={handleRegisterClick}
          >
            Register
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}

export default AddVendorModal;
