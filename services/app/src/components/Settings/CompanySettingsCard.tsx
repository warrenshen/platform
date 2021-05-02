import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  createStyles,
  Link,
  makeStyles,
  Typography,
} from "@material-ui/core";
import { grey } from "@material-ui/core/colors";
import Can from "components/Shared/Can";
import {
  CompanySettingsForCustomerFragment,
  CompanySettingsFragment,
  ContractFragment,
} from "generated/graphql";
import { Action } from "lib/auth/rbac-rules";
import { ProductTypeToLabel } from "lib/enum";
import { SettingsHelper } from "lib/settings";

interface Props {
  contract: ContractFragment | null;
  settings: CompanySettingsFragment | CompanySettingsForCustomerFragment;
  handleClick: () => void;
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

function CompanySettingsCard({ contract, settings, handleClick }: Props) {
  const classes = useStyles();

  if (contract === null) {
    return null;
  }

  const settingsHelper = new SettingsHelper(contract.product_type);

  return (
    <Card className={classes.card}>
      <CardContent>
        <Box display="flex" flexDirection="column">
          <Box display="flex" pb={0.25}>
            <Box className={classes.label}>Product Type</Box>
            <Box>
              <Typography variant="body2">
                {contract ? ProductTypeToLabel[contract.product_type] : "TBD"}
              </Typography>
            </Box>
          </Box>
          {settingsHelper.shouldShowVendorAgreement() && (
            <Box display="flex" pb={0.25}>
              <Box className={classes.label}>Vendor Agreement</Box>
              <Box>
                {settings.vendor_agreement_docusign_template ? (
                  <Link
                    href={settings.vendor_agreement_docusign_template}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Link
                  </Link>
                ) : (
                  <Typography variant="body2">TBD</Typography>
                )}
              </Box>
            </Box>
          )}
          {settingsHelper.shouldShowNoticeOfAssignment() && (
            <Box display="flex" pb={0.25}>
              <Box className={classes.label}>Notice of Assignment</Box>
              <Box>
                {settings.payor_agreement_docusign_template ? (
                  <Link
                    href={settings.payor_agreement_docusign_template}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Link
                  </Link>
                ) : (
                  <Typography variant="body2">TBD</Typography>
                )}
              </Box>
            </Box>
          )}
          <Box display="flex" pb={0.25}>
            <Box className={classes.label}>Autofinancing</Box>
            <Box>
              <Typography variant="body2">
                {settings.has_autofinancing ? (
                  <span>Enabled</span>
                ) : (
                  <span>Disabled</span>
                )}
              </Typography>
            </Box>
          </Box>
        </Box>
      </CardContent>
      <Can perform={Action.EditUserAccountSettings}>
        {handleClick && (
          <CardActions>
            <Button size="small" variant="outlined" onClick={handleClick}>
              Edit
            </Button>
          </CardActions>
        )}
      </Can>
    </Card>
  );
}

export default CompanySettingsCard;
