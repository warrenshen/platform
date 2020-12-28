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
  UsersInsertInput,
} from "generated/graphql";
import { useContext, useState } from "react";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    nameInput: {
      width: 400,
    },
    addressForm: {
      width: 600,
    },
    addressSubForm: {
      width: 140,
    },
  })
);

interface Props {
  handleClose: () => void;
}

function RegisterVendorModal(props: Props) {
  const {
    user: { companyId },
  } = useContext(CurrentUserContext);

  const classes = useStyles();
  const [vendor, setVendor] = useState<CompaniesInsertInput>({});
  const [contact, setContact] = useState<UsersInsertInput>({});
  const [addVendorPartnership, { loading }] = useAddVendorPartnershipMutation();

  return (
    <Dialog open onClose={props.handleClose} maxWidth="md">
      <DialogTitle>Register Vendor</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Please provide details about the vendor you'll be working with.
        </DialogContentText>
        <Box pb={3} pt={2}>
          <TextField
            label="Vendor Name"
            required
            className={classes.nameInput}
            value={vendor.name}
            onChange={({ target: { value } }) => {
              setVendor({ ...vendor, name: value });
            }}
          ></TextField>
          <Box
            display="flex"
            flexDirection="column"
            my={3}
            className={classes.addressForm}
          >
            <Typography variant="subtitle1">Primary Contact</Typography>
            <Box ml={1}>
              <TextField
                label="First Name"
                required
                className={classes.nameInput}
                value={contact.first_name}
                onChange={({ target: { value } }) => {
                  setContact({ ...contact, first_name: value });
                }}
              ></TextField>
              <TextField
                label="Last Name"
                required
                className={classes.nameInput}
                value={contact.last_name}
                onChange={({ target: { value } }) => {
                  setContact({ ...contact, last_name: value });
                }}
              ></TextField>
              <TextField
                label="Email"
                required
                className={classes.nameInput}
                value={contact.email}
                onChange={({ target: { value } }) => {
                  setContact({ ...contact, email: value });
                }}
              ></TextField>
              <TextField
                label="Phone Number"
                className={classes.nameInput}
                value={contact.phone_number}
                onChange={({ target: { value } }) => {
                  setContact({ ...contact, phone_number: value });
                }}
              ></TextField>
            </Box>
          </Box>
        </Box>

        <DialogContentText>
          After registering this vendor, our team will send you an email with a
          template Vendor Agreement between the vendor and Bespoke, to be signed
          by the vendor via Docusign. Once signed, our team will then verify
          bank account information and licenses.
        </DialogContentText>
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
              await addVendorPartnership({
                variables: {
                  vendorPartnership: {
                    vendor: {
                      data: {
                        ...vendor,
                        users: {
                          data: [{ ...contact }],
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
              props.handleClose();
            }}
            variant="contained"
            color="primary"
          >
            Add
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}

export default RegisterVendorModal;
