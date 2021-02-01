import {
  Box,
  Button,
  createStyles,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  makeStyles,
  TextField,
  Theme,
  Typography,
} from "@material-ui/core";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  CompaniesInsertInput,
  ListVendorPartnershipsDocument,
  useAddVendorPartnershipMutation,
  UserRolesEnum,
  UsersInsertInput,
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

function RegisterVendorModal(props: Props) {
  const {
    user: { companyId: userCompanyId, role },
  } = useContext(CurrentUserContext);

  const { companyId: paramsCompanyId } = useParams<CustomerParams>();
  const [errMsg, setErrMsg] = useState("");

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

  return (
    <Dialog
      open
      onClose={props.handleClose}
      maxWidth="md"
      classes={{ paper: classes.dialog }}
    >
      <DialogTitle>Register Vendor</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {role !== UserRolesEnum.BankAdmin
            ? "Please provide details about the vendor you are working with. After you register this vendor, Bespoke will email the vendor a Vendor Agreement via DocuSign. Once the vendor signs the agreement, Bespoke will verify the vendor's bank account information and licenses."
            : "Please provide details about the vendor you want to create."}
        </DialogContentText>
        <Box my={2}>
          <Box display="flex" flexDirection="column">
            <TextField
              label="Vendor Name"
              required
              value={vendor.name}
              onChange={({ target: { value } }) => {
                setVendor({ ...vendor, name: value });
              }}
            ></TextField>
          </Box>
          <Box display="flex" flexDirection="column" my={3}>
            <Typography variant="subtitle1">
              Vendor's Primary Contact
            </Typography>
            <Box display="flex" flexDirection="column" mx={2}>
              <TextField
                label="First Name"
                required
                value={contact.first_name}
                onChange={({ target: { value } }) => {
                  setContact({ ...contact, first_name: value });
                }}
              ></TextField>
              <TextField
                label="Last Name"
                required
                value={contact.last_name}
                onChange={({ target: { value } }) => {
                  setContact({ ...contact, last_name: value });
                }}
              ></TextField>
              <TextField
                label="Email"
                required
                value={contact.email}
                onChange={({ target: { value } }) => {
                  setContact({ ...contact, email: value });
                }}
              ></TextField>
              <TextField
                label="Phone Number"
                value={contact.phone_number}
                onChange={({ target: { value } }) => {
                  setContact({ ...contact, phone_number: value });
                }}
              ></TextField>
            </Box>
          </Box>
        </Box>
        {errMsg && <Box>Error: {errMsg}</Box>}
      </DialogContent>
      <DialogActions>
        <Box display="flex">
          <Box pr={1}>
            <Button onClick={props.handleClose}>Cancel</Button>
          </Box>

          <Button
            disabled={
              loading ||
              !vendor.name ||
              !contact.first_name ||
              !contact.last_name ||
              !contact.email
            }
            onClick={async () => {
              const resp = await addVendorPartnership({
                variables: {
                  vendorPartnership: {
                    company_id:
                      role === UserRolesEnum.BankAdmin ? companyId : undefined,
                    vendor: {
                      data: {
                        ...vendor,
                        is_vendor:
                          role === UserRolesEnum.BankAdmin ? true : undefined,
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
                    query: ListVendorPartnershipsDocument,
                    variables: {
                      companyId: companyId,
                    },
                  },
                ],
              });

              const vendorId =
                resp.data?.insert_company_vendor_partnerships_one?.vendor_id;
              if (!vendorId) {
                setErrMsg("Empty vendor id provided");
                return;
              }
              const emailResp = await notifier.sendVendorAgreementWithCustomer({
                company_id: companyId,
                vendor_id: vendorId,
              });

              if (emailResp.status !== "OK") {
                setErrMsg("Could not send email. Error: " + emailResp.msg);
                return;
              }

              props.handleClose();
            }}
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
