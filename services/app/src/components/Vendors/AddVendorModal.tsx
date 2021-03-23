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
  useAddVendorPartnershipMutation,
  UserRolesEnum,
  UsersInsertInput,
} from "generated/graphql";
import useSnackbar from "hooks/useSnackbar";
import { InventoryNotifier } from "lib/notifications/inventory";
import { useContext, useState } from "react";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    dialog: {
      width: 500,
    },
  })
);

interface Props {
  companyId: Companies["id"];
  handleClose: () => void;
}

function AddVendorModal({ companyId, handleClose }: Props) {
  const classes = useStyles();
  const snackbar = useSnackbar();
  const {
    user: { role },
  } = useContext(CurrentUserContext);

  const [errorMessage, setErrorMessage] = useState("");

  const [vendor, setVendor] = useState<CompaniesInsertInput>({ name: "" });
  const [contact, setContact] = useState<UsersInsertInput>({
    first_name: "",
    email: "",
    last_name: "",
    phone_number: "",
  });
  const [addVendorPartnership, { loading }] = useAddVendorPartnershipMutation();
  const notifier = new InventoryNotifier();

  const handleRegisterClick = async () => {
    try {
      const response = await addVendorPartnership({
        variables: {
          vendorPartnership: {
            company_id:
              role === UserRolesEnum.BankAdmin ? companyId : undefined,
            vendor: {
              data: {
                name: vendor.name,
                company_type: CompanyTypeEnum.Vendor,
                users: {
                  data: [{ ...contact }],
                },
                settings: {
                  data: {},
                },
              },
            },
          },
        },
      });

      const vendorId =
        response.data?.insert_company_vendor_partnerships_one?.vendor_id;
      if (!vendorId) {
        setErrorMessage("Error! Empty vendor id provided");
        return;
      }
      const emailResp = await notifier.sendVendorAgreementWithCustomer({
        company_id: companyId,
        vendor_id: vendorId,
      });

      if (emailResp.status !== "OK") {
        setErrorMessage("Could not send email. Error: " + emailResp.msg);
        return;
      }

      snackbar.showSuccess("Success! Vendor created.");
      handleClose();
    } catch (error) {
      setErrorMessage(
        "Could not create Vendor. Please fill out all required fields and ensure the email is not already taken."
      );
    }
  };

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
            disabled={
              loading ||
              !vendor.name ||
              !contact.first_name ||
              !contact.last_name ||
              !contact.email
            }
            onClick={handleRegisterClick}
            variant="contained"
            color="primary"
          >
            Register
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}

export default AddVendorModal;
