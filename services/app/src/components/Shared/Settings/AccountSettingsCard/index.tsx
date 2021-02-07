import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  createStyles,
  Link,
  makeStyles,
} from "@material-ui/core";
import { grey } from "@material-ui/core/colors";
import Can from "components/Shared/Can";
import ContractTermsLink from "components/Shared/Settings/ContractTermsLink";
import {
  CompanySettingsForCustomerFragment,
  CompanySettingsFragment,
} from "generated/graphql";
import { Action } from "lib/auth/rbac-rules";
import { ProductTypeToLabel } from "lib/enum";
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
            <Box>{ProductTypeToLabel[settings.product_type]}</Box>
          </Box>
          <Box display="flex" pb={0.25}>
            <Box className={classes.label}>Vendor Agreement</Box>
            <Box>
              <Link
                href={settings.vendor_agreement_docusign_template || ""}
                rel="noreferrer"
                target="_blank"
              >
                Link
              </Link>
            </Box>
          </Box>
          <Box display="flex" pb={0.25}>
            <Box className={classes.label}>Contract Terms</Box>
            <Box>
              <ContractTermsLink
                linkText="View"
                contractConfig={{
                  product_type: settings.product_type,
                  product_config: settings.product_config,
                  isViewOnly: true,
                }}
              ></ContractTermsLink>
            </Box>
          </Box>
        </Box>
      </CardContent>
      <Can perform={Action.EditUserAccountSettings}>
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
      </Can>
    </Card>
  );
}

export default AccountSettingsCard;
