import { Box, Drawer, makeStyles, Typography } from "@material-ui/core";
import BankAccount from "components/Vendors/Bank/VendorDrawer/BankAccount";
import Contacts from "components/Vendors/Bank/VendorDrawer/Contacts";
import VendorInfo from "components/Vendors/Bank/VendorDrawer/VendorInfo";
import {
  CompanyVendorPartnerships,
  useBankVendorPartnershipQuery,
} from "generated/graphql";
import { omit } from "lodash";

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
        <Box py={3}>
          <VendorInfo vendor={omit(vendor, ["users"])}></VendorInfo>
        </Box>
        <Typography variant="h6"> Contacts </Typography>
        <Contacts
          contacts={vendor.users}
          companyId={vendor.id}
          companyVendorPartnershipId={data.company_vendor_partnerships_by_pk.id}
        ></Contacts>
        <Typography variant="h6"> Bank Information </Typography>
        <BankAccount
          companyId={vendor.id}
          companyVendorPartnershipId={data.company_vendor_partnerships_by_pk.id}
          bankAccount={
            data.company_vendor_partnerships_by_pk.vendor_bank_account
          }
        ></BankAccount>
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
        <Typography variant="h6"> Customers </Typography>
      </Box>
    </Drawer>
  );
}

export default VendorDrawer;
