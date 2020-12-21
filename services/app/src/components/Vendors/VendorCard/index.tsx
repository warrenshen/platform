import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  createStyles,
  makeStyles,
  Theme,
  Typography,
} from "@material-ui/core";
import { CheckCircle } from "@material-ui/icons";
import { VendorFragment, VendorPartnershipFragment } from "generated/graphql";

interface Props {
  vendorPartnership: VendorPartnershipFragment & { vendor: VendorFragment };
  onClick?: () => void;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    card: {
      width: 300,
      minHeight: 235,
    },
  })
);

function VendorCard(props: Props) {
  const classes = useStyles();
  const vendor = props.vendorPartnership.vendor;

  return (
    <Card className={classes.card}>
      <CardContent>
        <Typography variant="h6">{vendor.name}</Typography>
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
