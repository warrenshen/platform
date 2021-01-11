import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  createStyles,
  makeStyles,
  Typography,
} from "@material-ui/core";
import { CheckCircle } from "@material-ui/icons";
import {
  VendorFragment,
  VendorLimitedFragment,
  VendorPartnershipFragment,
} from "generated/graphql";

interface Props {
  vendorPartnership: VendorPartnershipFragment;
  vendor: VendorFragment | VendorLimitedFragment;
  onClick?: () => void;
}

const useStyles = makeStyles(() =>
  createStyles({
    card: {
      width: 300,
      minHeight: 200,
    },
  })
);

function isCompany(
  vendor: VendorFragment | VendorLimitedFragment
): vendor is VendorFragment {
  return (vendor as VendorFragment).address !== undefined;
}

function VendorCard(props: Props) {
  const classes = useStyles();
  const vendor = props.vendor;

  return (
    <Card className={classes.card}>
      <CardContent>
        <Typography variant="h6">{vendor?.name}</Typography>
        {isCompany(vendor) && (
          <>
            <Box py={1}>
              <Box>
                {vendor.address && (
                  <>
                    <Box>{vendor.address}</Box>
                    <Box>
                      {vendor.city}, {vendor.state} {vendor.country}{" "}
                      {vendor.zip_code}
                    </Box>
                  </>
                )}
              </Box>
            </Box>
            {vendor.phone_number ? <Box>{vendor.phone_number}</Box> : null}
          </>
        )}

        <Box display="flex" flexDirection="column" pt={2}>
          <Box display="flex">
            <CheckCircle
              color={
                props.vendorPartnership.vendor_agreement_id
                  ? "primary"
                  : "disabled"
              }
            ></CheckCircle>
            <Box pl={1}>Signed Vendor Agreement</Box>
          </Box>
          <Box display="flex">
            <CheckCircle
              color={
                props.vendorPartnership.vendor_license_id
                  ? "primary"
                  : "disabled"
              }
            ></CheckCircle>
            <Box pl={1}>Verified license</Box>
          </Box>
          <Box display="flex">
            <CheckCircle
              color={
                props.vendorPartnership.vendor_bank_account?.verified_at
                  ? "primary"
                  : "disabled"
              }
            ></CheckCircle>
            <Box pl={1}>Verified bank account</Box>
          </Box>
        </Box>
      </CardContent>
      {props.onClick && (
        <CardActions>
          <Button
            size="small"
            variant="outlined"
            onClick={() => {
              props.onClick && props.onClick();
            }}
          >
            See more
          </Button>
        </CardActions>
      )}
    </Card>
  );
}

export default VendorCard;
