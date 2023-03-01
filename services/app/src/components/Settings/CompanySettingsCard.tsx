import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Link,
  Typography,
  createStyles,
  makeStyles,
} from "@material-ui/core";
import { grey } from "@material-ui/core/colors";
import Can from "components/Shared/Can";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  CompanySettingsFragment,
  CompanySettingsLimitedFragment,
  ContractFragment,
} from "generated/graphql";
import useSnackbar from "hooks/useSnackbar";
import { CopyIcon } from "icons";
import { Action } from "lib/auth/rbac-rules";
import {
  PlatformModeEnum,
  ProductTypeEnum,
  ProductTypeToLabel,
} from "lib/enum";
import { SettingsHelper } from "lib/settings";
import { useContext } from "react";

interface Props {
  contract: ContractFragment | null;
  settings: CompanySettingsFragment | CompanySettingsLimitedFragment;
  handleClick: () => void;
}

const useStyles = makeStyles(() =>
  createStyles({
    card: {
      width: 400,
      minHeight: 100,
    },
    label: {
      width: 200,
      color: grey[600],
    },
  })
);

function CompanySettingsCard({ contract, settings, handleClick }: Props) {
  const classes = useStyles();
  const snackbar = useSnackbar();

  const {
    user: { platformMode },
  } = useContext(CurrentUserContext);
  const isBankUser = platformMode === PlatformModeEnum.Bank;

  if (contract === null) {
    return null;
  }

  const settingsHelper = new SettingsHelper(
    contract.product_type as ProductTypeEnum
  );

  const isAutoRepaymentsEnabled = !!settings?.is_autogenerate_repayments_enabled
    ? settings.is_autogenerate_repayments_enabled
    : false;

  const isEditButtonShown =
    isBankUser ||
    (!isBankUser && settingsHelper.shouldShowAutogenerateRepayments());

  const baseUrl = window.location.protocol + "//" + window.location.host;

  return (
    <Card className={classes.card}>
      <CardContent>
        <Box display="flex" flexDirection="column">
          <Box display="flex" pb={0.25}>
            <Box className={classes.label}>Product Type</Box>
            <Box>
              <Typography variant="body2">
                {contract
                  ? ProductTypeToLabel[contract.product_type as ProductTypeEnum]
                  : "TBD"}
              </Typography>
            </Box>
          </Box>
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
          {settingsHelper.shouldShowVendorOnboardingLink() && (
            <Box display="flex" pb={0.25}>
              <Box className={classes.label}>Vendor Onboarding Link</Box>
              <Box display="flex" flexDirection="row">
                <Link
                  href={`/vendor-form/${settings.company_id}/`}
                  rel="noreferrer"
                  target="_blank"
                >
                  Link
                </Link>
                <Button
                  style={{
                    minWidth: "18px",
                    padding: "0",
                    margin: "0 0 0 4px",
                  }}
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${baseUrl}/vendor-form/${settings.company_id}/`
                    );
                    snackbar.showSuccess("Copied to clipboard!");
                  }}
                >
                  <CopyIcon />
                </Button>
              </Box>
            </Box>
          )}
          <Box display="flex" pb={0.25}>
            <Box className={classes.label}>Is Autofinancing Enabled?</Box>
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
          {settingsHelper.shouldShowAutogenerateRepayments() && (
            <Box display="flex" pb={0.25}>
              <Box className={classes.label}>Is Autorepayment Enabled?</Box>
              <Box>
                <Typography variant="body2">
                  {isAutoRepaymentsEnabled ? (
                    <span>Enabled</span>
                  ) : (
                    <span>Disabled</span>
                  )}
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      </CardContent>
      <Can perform={Action.EditUserAccountSettings}>
        {handleClick && isEditButtonShown && (
          <CardActions>
            <Button
              size="small"
              variant="outlined"
              disabled={!contract}
              onClick={handleClick}
            >
              Edit
            </Button>
          </CardActions>
        )}
      </Can>
    </Card>
  );
}

export default CompanySettingsCard;
