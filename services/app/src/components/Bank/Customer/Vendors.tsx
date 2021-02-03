import { Box, createStyles, makeStyles, Theme } from "@material-ui/core";
import AddButton from "components/Vendors/AddVendor/Button";
import ClickableVendorCard from "components/Vendors/Bank/ClickableVendorCard";
import { useBankCustomerListVendorPartnershipsQuery } from "generated/graphql";
import { sortBy } from "lodash";
import { CustomerParams } from "pages/Bank/Customer";
import { useParams } from "react-router-dom";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      padding: theme.spacing(3),
      overflow: "scroll",
    },
  })
);

function Vendors() {
  const classes = useStyles();
  const { companyId } = useParams<CustomerParams>();
  const { data } = useBankCustomerListVendorPartnershipsQuery({
    variables: {
      companyId: companyId,
    },
  });

  if (!data || !data.company_vendor_partnerships) {
    return null;
  }

  const vendorPartnerships = sortBy(
    data.company_vendor_partnerships,
    (item) => item.vendor.name
  );

  return (
    <Box className={classes.container}>
      <Box display="flex" flexDirection="row-reverse">
        <AddButton></AddButton>
      </Box>
      <Box display="flex" flexWrap="wrap">
        {vendorPartnerships.map((vendorPartnership) => {
          return (
            <Box pt={2} pr={3} key={vendorPartnership.id}>
              <ClickableVendorCard
                vendorPartnership={vendorPartnership}
              ></ClickableVendorCard>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

export default Vendors;
