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
  CompaniesInsertInput,
  CompanyTypeEnum,
  useAddVendorPartnershipMutation,
  UserRolesEnum,
  UsersInsertInput,
  VendorPartnershipsByCompanyIdDocument,
} from "generated/graphql";
import { InventoryNotifier } from "lib/notifications/inventory";
import { CustomerParams } from "pages/Bank/Customer";
import { useContext, useState } from "react";
import { useParams } from "react-router-dom";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    dialog: {
      width: 500,
    },
  })
);

interface Props {
  handleClose: () => void;
}

function RegisterVendorModal({ handleClose }: Props) {
  const {
    user: { companyId: userCompanyId, role },
  } = useContext(CurrentUserContext);

  const { companyId: paramsCompanyId } = useParams<CustomerParams>();
  const [errorMessage, setErrorMessage] = useState("");

  const companyId = paramsCompanyId || userCompanyId;

  const classes = useStyles();
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
        refetchQueries: [
          {
            query: VendorPartnershipsByCompanyIdDocument,
            variables: {
              companyId: companyId,
            },
          },
        ],
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
      <DialogTitle>Register Vendor</DialogTitle>
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

export default RegisterVendorModal;
