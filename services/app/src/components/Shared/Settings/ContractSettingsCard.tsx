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
import Can from "components/Shared/Can";
import ContractTermsLink from "components/Shared/Settings/ContractTermsLink";
import { ContractFragment } from "generated/graphql";
import { Action } from "lib/auth/rbac-rules";
import { ProductTypeToLabel } from "lib/enum";

interface Props {
  contract: ContractFragment;
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

function ContractSettingsCard({ contract, handleClick }: Props) {
  const classes = useStyles();

  return (
    <Card className={classes.card}>
      <CardContent>
        <Box display="flex" flexDirection="column">
          <Box display="flex" pb={0.25}>
            <Box className={classes.label}>Contract Type</Box>
            <Box>{ProductTypeToLabel[contract.product_type]}</Box>
          </Box>
          <Box display="flex" pb={0.25}>
            <Box className={classes.label}>Contract Terms</Box>
            <Box>
              <ContractTermsLink
                linkText="View"
                contractId={contract.id}
              ></ContractTermsLink>
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

export default ContractSettingsCard;
