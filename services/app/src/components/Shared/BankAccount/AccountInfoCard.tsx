import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  makeStyles,
} from "@material-ui/core";
import { grey } from "@material-ui/core/colors";
import { CheckCircle } from "@material-ui/icons";
import AccountModal from "components/Shared/BankAccount/AccountModal";
import { BankAccountFragment } from "generated/graphql";
import { calendarDateTimestamp } from "lib/time";
import { useState } from "react";

const useStyles = makeStyles({
  baseInput: {
    width: 300,
  },
  label: {
    width: 130,
    color: grey[600],
  },
});
function AccountInfoCard(props: { bankAccount: BankAccountFragment }) {
  const classes = useStyles();
  const [editing, setEditing] = useState(false);

  return (
    <>
      {editing && (
        <AccountModal
          bankAccount={props.bankAccount}
          companyId={props.bankAccount.company_id}
          handleClose={() => setEditing(false)}
        ></AccountModal>
      )}
      <Card>
        <CardContent>
          <Box display="flex" pb={0.25}>
            <Box className={classes.label}>Bank</Box>
            <Box>{props.bankAccount.bank_name}</Box>
          </Box>
          <Box display="flex" pb={0.25}>
            <Box className={classes.label}>Account Type</Box>
            <Box>{props.bankAccount.account_type}</Box>
          </Box>
          <Box display="flex" pb={0.25}>
            <Box className={classes.label}>Routing Number</Box>
            <Box>{props.bankAccount.routing_number}</Box>
          </Box>
          <Box display="flex" pb={0.25}>
            <Box className={classes.label}>Account Number</Box>
            <Box>{props.bankAccount.account_number}</Box>
          </Box>
          <Box display="flex" pt={0.5} pb={1}>
            <CheckCircle
              color={props.bankAccount.verified_at ? "primary" : "disabled"}
            ></CheckCircle>
            <Box pl={1}>
              {props.bankAccount.verified_at
                ? `Verified on ${calendarDateTimestamp(
                    props.bankAccount.verified_at
                  )}`
                : "Not yet verified"}
            </Box>
          </Box>
        </CardContent>
        <CardActions>
          <Button
            size="small"
            variant="outlined"
            onClick={() => {
              setEditing(true);
            }}
          >
            Edit
          </Button>
        </CardActions>
      </Card>
    </>
  );
}

export default AccountInfoCard;
