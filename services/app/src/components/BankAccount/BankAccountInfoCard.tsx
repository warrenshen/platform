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
import CreateUpdateBankAccountModal from "components/BankAccount/CreateUpdateBankAccountModal";
import ModalButton from "components/Shared/Modal/ModalButton";
import {
  BankAccountForVendorFragment,
  BankAccountFragment,
} from "generated/graphql";
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
  isCannabisCompliantVisible?: boolean;
  isEditAllowed?: boolean;
  isVerificationVisible?: boolean;
  bankAccount: BankAccountFragment | BankAccountForVendorFragment;
  handleDataChange?: () => void;
}

function BankAccountInfoCard({
  isCannabisCompliantVisible = false,
  isEditAllowed = false,
  isVerificationVisible = false,
  bankAccount,
  handleDataChange,
}: Props) {
  const classes = useStyles();
  const [isObfuscateEnabled, setIsObfuscateEnabled] = useState(true);

  return (
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
          <Box>
            {isObfuscateEnabled
              ? obfuscateBankNumbers(bankAccount.routing_number)
              : bankAccount.routing_number}
          </Box>
        </Box>
        <Box display="flex" pb={0.25}>
          <Box className={classes.label}>Account Number</Box>
          <Box>
            {isObfuscateEnabled
              ? obfuscateBankNumbers(bankAccount.account_number)
              : bankAccount.account_number}
          </Box>
        </Box>
        <Box display="flex" pt={0.5} pb={0.25}>
          <Button
            color="default"
            size="small"
            variant="outlined"
            onClick={() => setIsObfuscateEnabled(!isObfuscateEnabled)}
          >
            {isObfuscateEnabled ? "Reveal Numbers" : "Hide Numbers"}
          </Button>
        </Box>
        {isVerificationVisible && (
          <Box display="flex" alignItems="center" pt={0.5} pb={1}>
            <CheckCircle
              color={
                (bankAccount as BankAccountFragment).verified_at &&
                (bankAccount as BankAccountFragment).verified_date
                  ? "primary"
                  : "disabled"
              }
            />
            <Box pl={1}>
              {(bankAccount as BankAccountFragment).verified_at &&
              (bankAccount as BankAccountFragment).verified_date
                ? `Verified on ${formatDateString(
                    (bankAccount as BankAccountFragment).verified_date
                  )}`
                : "Not yet verified"}
            </Box>
          </Box>
        )}
        {isCannabisCompliantVisible && (
          <Box display="flex" alignItems="center" pt={0.5} pb={1}>
            <CheckCircle
              color={
                (bankAccount as BankAccountFragment).is_cannabis_compliant
                  ? "primary"
                  : "disabled"
              }
            />
            <Box pl={1}>
              {(bankAccount as BankAccountFragment).is_cannabis_compliant
                ? "Cannabis Compliant"
                : "Not Cannabis Compliant"}
            </Box>
          </Box>
        )}
      </CardContent>
      {isEditAllowed && (
        <CardActions>
          <ModalButton
            label={"Edit"}
            color="default"
            size="small"
            variant="outlined"
            modal={({ handleClose }) => (
              <CreateUpdateBankAccountModal
                companyId={bankAccount.company_id}
                existingBankAccount={bankAccount as BankAccountFragment}
                handleClose={() => {
                  !!handleDataChange && handleDataChange();
                  handleClose();
                }}
              />
            )}
          />
        </CardActions>
      )}
    </Card>
  );
}

export default BankAccountInfoCard;
