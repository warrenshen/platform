import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Typography,
} from "@material-ui/core";
import { CheckCircle } from "@material-ui/icons";
import { VendorPartnershipFragment } from "generated/graphql";

interface Props {
  vendorPartnership: VendorPartnershipFragment;
  onClick?: () => void;
}

function VendorCard(props: Props) {
  const vendor = props.vendorPartnership.vendor;

  return (
    <Card style={{ width: 300 }}>
      <CardContent>
        <Typography variant="h6">{vendor.name}</Typography>
        <Box py={1}>
          <Box>
            <Box>{vendor.address}</Box>
            <Box>
              {vendor.city}, {vendor.state} {vendor.country} {vendor.zip_code}
            </Box>
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
            <Box pl={1}>Signed Vender Agreement</Box>
          </Box>
          <Box display="flex">
            <CheckCircle
              color={
                props.vendorPartnership.vendor_license_id
                  ? "primary"
                  : "disabled"
              }
            ></CheckCircle>
            <Box pl={1}>License verified</Box>
          </Box>
          <Box display="flex">
            <CheckCircle
              color={
                props.vendorPartnership.vendor_bank_account?.verified_at
                  ? "primary"
                  : "disabled"
              }
            ></CheckCircle>
            <Box pl={1}>Bank account verified</Box>
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
