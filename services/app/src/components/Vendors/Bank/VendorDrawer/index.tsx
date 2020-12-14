import {
  Box,
  Drawer,
  makeStyles,
  TextField,
  Typography,
} from "@material-ui/core";
import BankAccountInput from "components/Vendors/Bank/VendorDrawer/BankAccountInput";
import {
  CompanyVendorPartnerships,
  useBankVendorPartnershipQuery,
} from "generated/graphql";

const useStyles = makeStyles({
  drawerContent: {
    width: 700,
  },
  baseInput: {
    width: 300,
  },
  addressForm: {
    width: 600,
  },
  fileDropbox: {
    border: "1px dotted black",
    height: 100,
    width: 600,
  },
});

function VendorDrawer(props: {
  vendorPartnershipId: CompanyVendorPartnerships["id"];
  onClose: () => void;
}) {
  const classes = useStyles();

  const { data } = useBankVendorPartnershipQuery({
    variables: {
      id: props.vendorPartnershipId,
    },
  });

  if (!data?.company_vendor_partnerships_by_pk) {
    return null;
  }

  const vendor = data.company_vendor_partnerships_by_pk.vendor;

  return (
    <Drawer open anchor="right" onClose={props.onClose}>
      <Box className={classes.drawerContent} p={4}>
        <Typography variant="h6">{vendor.name}</Typography>
        <TextField
          label="Name"
          className={classes.baseInput}
          value={vendor.name}
          onChange={({ target: { value } }) => {
            // setVendor({ ...vendor, name: value });
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
              // setVendor({ ...vendor, address: value });
            }}
          ></TextField>
          <Box display="flex" justifyContent="space-between" pt={1}>
            <TextField
              label="Country"
              onChange={({ target: { value } }) => {
                // setVendor({ ...vendor, country: value });
              }}
            ></TextField>
            <TextField
              label="State"
              onChange={({ target: { value } }) => {
                // setVendor({ ...vendor, state: value });
              }}
            ></TextField>
            <TextField
              label="City"
              onChange={({ target: { value } }) => {
                // setVendor({ ...vendor, city: value });
              }}
            ></TextField>
            <TextField
              label="Zip Code"
              onChange={({ target: { value } }) => {
                // setVendor({ ...vendor, zip_code: value });
              }}
            ></TextField>
          </Box>
        </Box>
        <Typography variant="h6"> Bank Information </Typography>
        <BankAccountInput
          companyId={vendor.id}
          companyVendorPartnershipId={data.company_vendor_partnerships_by_pk.id}
          bankAccount={
            data.company_vendor_partnerships_by_pk.vendor_bank_account
          }
        ></BankAccountInput>
        <Typography variant="h6"> Licenses </Typography>
        <Box
          mt={1}
          mb={2}
          className={classes.fileDropbox}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Box>Upload</Box>
        </Box>
        <Typography variant="h6"> Vendor Agreement </Typography>
        <Box
          mt={1}
          mb={2}
          display="flex"
          alignItems="center"
          justifyContent="center"
          className={classes.fileDropbox}
        >
          <Box>Upload</Box>
        </Box>
      </Box>
    </Drawer>
  );
}

export default VendorDrawer;
