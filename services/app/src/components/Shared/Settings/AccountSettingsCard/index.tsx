import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  createStyles,
  makeStyles,
} from "@material-ui/core";
import { grey } from "@material-ui/core/colors";
import {
  CompanySettingsForCustomerFragment,
  CompanySettingsFragment,
} from "generated/graphql";

interface Props {
  settings: CompanySettingsFragment | CompanySettingsForCustomerFragment;
  onClick: () => void;
}

const useStyles = makeStyles(() =>
  createStyles({
    card: {
      width: 300,
      minHeight: 100,
    },
    label: {
      width: 130,
      color: grey[600],
    },
  })
);

function AccountSettingsCard(props: Props) {
  const classes = useStyles();
  const settings = props.settings;

  return (
    <Card className={classes.card}>
      <CardContent>
        <Box display="flex" flexDirection="column" pt={2}>
          <Box display="flex" pb={0.25}>
            <Box className={classes.label}>Product Type</Box>
            <Box>{settings.product_type}</Box>
          </Box>
          <Box display="flex" pb={0.25}>
            <Box className={classes.label}>Vendor Agreement</Box>
            <Box>{settings.vendor_agreement_docusign_template}</Box>
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
            Edit
          </Button>
        </CardActions>
      )}
    </Card>
  );
}

export default AccountSettingsCard;
