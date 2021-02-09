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
import CreateUpdateBankAccountModal from "components/Shared/BankAccount/CreateUpdateBankAccountModal";
import { BankAccountFragment } from "generated/graphql";
import { formatDateString } from "lib/date";
import { obfuscateBankNumbers } from "lib/privacy";
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

interface Props {
  isEditAllowed?: boolean;
  isVerificationVisible?: boolean;
  bankAccount: BankAccountFragment;
}

function BankAccountInfoCard({
  isEditAllowed = true,
  isVerificationVisible = true,
  bankAccount,
}: Props) {
  const classes = useStyles();
  const [editing, setEditing] = useState(false);

  return (
    <>
      {editing && (
        <CreateUpdateBankAccountModal
          companyId={bankAccount.company_id}
          existingBankAccount={bankAccount}
          handleClose={() => setEditing(false)}
        ></CreateUpdateBankAccountModal>
      )}
      <Card>
        <CardContent>
          <Box display="flex" pb={0.25}>
            <Box className={classes.label}>Bank</Box>
            <Box>{bankAccount.bank_name}</Box>
          </Box>
          <Box display="flex" pb={0.25}>
            <Box className={classes.label}>Account Title</Box>
            <Box>{bankAccount.account_title}</Box>
          </Box>
          <Box display="flex" pb={0.25}>
            <Box className={classes.label}>Account Type</Box>
            <Box>{bankAccount.account_type}</Box>
          </Box>
          <Box display="flex" pb={0.25}>
            <Box className={classes.label}>Routing Number</Box>
            <Box>{obfuscateBankNumbers(bankAccount.routing_number)}</Box>
          </Box>
          <Box display="flex" pb={0.25}>
            <Box className={classes.label}>Account Number</Box>
            <Box>{obfuscateBankNumbers(bankAccount.account_number)}</Box>
          </Box>
          {isVerificationVisible && (
            <Box display="flex" alignItems="center" pt={0.5} pb={1}>
              <CheckCircle
                color={
                  bankAccount.verified_at && bankAccount.verified_date
                    ? "primary"
                    : "disabled"
                }
              ></CheckCircle>
              <Box pl={1}>
                {bankAccount.verified_at && bankAccount.verified_date
                  ? `Verified on ${formatDateString(bankAccount.verified_date)}`
                  : "Not yet verified"}
              </Box>
            </Box>
          )}
        </CardContent>
        {isEditAllowed && (
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
        )}
      </Card>
    </>
  );
}

export default BankAccountInfoCard;
