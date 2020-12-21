import {
  Box,
  Button,
  Card,
  CardContent,
  createStyles,
  makeStyles,
  Theme,
  Typography,
} from "@material-ui/core";
import { grey } from "@material-ui/core/colors";
import {
  BankAccountFragment,
  CompanyBankAccountFragment,
} from "generated/graphql";
import { ActionType } from "lib/ActionType";
import { calendarDateTimestamp } from "lib/time";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    bankAccountCard: {
      marginRight: theme.spacing(2),
    },
    baseInput: {
      width: 300,
    },
    label: {
      width: 130,
      color: grey[600],
    },
    editButton: {
      marginTop: theme.spacing(2),
    },
  })
);

interface Params {
  bankAccount: CompanyBankAccountFragment;
  actionType: ActionType;
  setActionType: (type: ActionType) => void;
  open: boolean;
  setOpen: (value: boolean) => void;
  setCurrentBankAccount: (bankAccount: BankAccountFragment) => void;
}

function BankAccountInfo({
  bankAccount,
  setCurrentBankAccount,
  setActionType,
  setOpen,
}: Params) {
  const classes = useStyles();
  return (
    <Card className={classes.bankAccountCard}>
      <CardContent>
        <Typography variant="h6">{bankAccount?.name}</Typography>
        <Box display="flex" pb={0.25}>
          <Box className={classes.label}>Account name</Box>
          <Box>{bankAccount?.account_name}</Box>
        </Box>
        <Box display="flex" pb={0.25}>
          <Box className={classes.label}>Account number</Box>
          <Box>{bankAccount?.account_number}</Box>
        </Box>
        <Box display="flex" pb={0.25}>
          <Box className={classes.label}>Routing number</Box>
          <Box>{bankAccount?.routing_number}</Box>
        </Box>
        <Box display="flex" pb={0.25}>
          <Box className={classes.label}>Notes</Box>
          <Box>{bankAccount?.notes}</Box>
        </Box>
        <Box display="flex" pb={0.25}>
          <Box className={classes.label}>Verified at</Box>
          <Box>
            {bankAccount?.verified_at
              ? calendarDateTimestamp(bankAccount?.verified_at)
              : ""}
          </Box>
        </Box>
        <Button
          className={classes.editButton}
          onClick={() => {
            setCurrentBankAccount(bankAccount);
            setActionType(ActionType.Update);
            setOpen(true);
          }}
          color="primary"
          variant="contained"
        >
          Edit
        </Button>
      </CardContent>
    </Card>
  );
}

export default BankAccountInfo;
