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
} from "@material-ui/core";
import {
  CompaniesInsertInput,
  ListVendorPartnershipsDocument,
  useAddVendorPartnershipMutation,
} from "generated/graphql";
import { useState } from "react";

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
  const classes = useStyles();
  const [vendor, setVendor] = useState<CompaniesInsertInput>({});
  const [addVendorPartnership, { loading }] = useAddVendorPartnershipMutation();

  return (
    <Dialog
      open
      onClose={props.handleClose}
      // className={classes.dialog}
      maxWidth="md"
    >
      <DialogTitle>Register Vendor</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Please provide details about the vendor you'll be working with.
        </DialogContentText>
        <Box pb={3} pt={2}>
          <TextField
            label="Name"
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
            <TextField
              label="Address"
              onChange={({ target: { value } }) => {
                setVendor({ ...vendor, address: value });
              }}
            ></TextField>
            <Box display="flex" justifyContent="space-between" pt={1}>
              <TextField
                className={classes.addressSubForm}
                label="Country"
                onChange={({ target: { value } }) => {
                  setVendor({ ...vendor, country: value });
                }}
              ></TextField>
              <TextField
                className={classes.addressSubForm}
                label="State"
                onChange={({ target: { value } }) => {
                  setVendor({ ...vendor, state: value });
                }}
              ></TextField>
              <TextField
                className={classes.addressSubForm}
                label="City"
                onChange={({ target: { value } }) => {
                  setVendor({ ...vendor, city: value });
                }}
              ></TextField>
              <TextField
                className={classes.addressSubForm}
                label="Zip Code"
                onChange={({ target: { value } }) => {
                  setVendor({ ...vendor, zip_code: value });
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
            disabled={loading}
            onClick={async () => {
              await addVendorPartnership({
                variables: {
                  vendor: {
                    company_id: "57ee8797-1d5b-4a90-83c9-84c740590e42",
                    vendor: {
                      data: vendor,
                    },
                  },
                },
                refetchQueries: [
                  {
                    query: ListVendorPartnershipsDocument,
                    variables: {
                      companyId: "57ee8797-1d5b-4a90-83c9-84c740590e42",
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
