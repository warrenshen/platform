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
  BankAccountLimitedFragment,
} from "generated/graphql";
import { formatDateString } from "lib/date";
import { obfuscateBankNumbers } from "lib/privacy";
import { useState } from "react";

const useStyles = makeStyles({
  baseInput: {
    width: 300,
  },
  label: {
    paddingRight: 16,
    color: grey[600],
  },
});

interface Props {
  isCannabisCompliantVisible?: boolean;
  isEditAllowed?: boolean;
  isTemplateNameVisible?: boolean;
  isVerificationVisible?: boolean;
  bankAccount:
    | BankAccountFragment
    | BankAccountLimitedFragment
    | BankAccountForVendorFragment;
  handleDataChange?: () => void;
}

export default function BankAccountInfoCard({
  isCannabisCompliantVisible = false,
  isEditAllowed = false,
  isTemplateNameVisible = false,
  isVerificationVisible = false,
  bankAccount,
  handleDataChange,
}: Props) {
  const classes = useStyles();

  const [isObfuscateEnabled, setIsObfuscateEnabled] = useState(true);

  return (
    <>
      {!bankAccount && (
        <Box display="flex">
          No bank account information available for this payment.
        </Box>
      )}
      {!!bankAccount && (
        <Card>
          <CardContent>
            <Box display="flex" pb={0.5}>
              <Box className={classes.label}>Bank Name</Box>
              <Box>{bankAccount.bank_name}</Box>
            </Box>
            <Box display="flex" pb={0.5}>
              <Box className={classes.label}>Account Name</Box>
              <Box>{bankAccount.account_title}</Box>
            </Box>
            <Box display="flex" pb={0.5}>
              <Box className={classes.label}>Account Type</Box>
              <Box>{bankAccount.account_type}</Box>
            </Box>
            <Box display="flex" pb={0.5}>
              <Box className={classes.label}>Account Number</Box>
              <Box>
                {isObfuscateEnabled
                  ? obfuscateBankNumbers(bankAccount.account_number)
                  : bankAccount.account_number}
              </Box>
            </Box>
            <Box display="flex" alignItems="center" pt={0.5} pb={1}>
              <CheckCircle
                color={
                  (bankAccount as BankAccountFragment).can_ach
                    ? "primary"
                    : "disabled"
                }
              />
              <Box pl={1}>{"ACH?"}</Box>
            </Box>
            {!!(bankAccount as BankAccountFragment).can_ach && (
              <Box display="flex" flexDirection="column" pl={2}>
                <Box display="flex" pb={0.5}>
                  <Box className={classes.label}>ACH Routing Number</Box>
                  <Box>
                    {isObfuscateEnabled && !!bankAccount?.routing_number
                      ? obfuscateBankNumbers(bankAccount.routing_number)
                      : bankAccount.routing_number}
                  </Box>
                </Box>
                <Box display="flex" pb={0.5}>
                  <Box className={classes.label}>ACH Default Memo</Box>
                  <Box>
                    {(bankAccount as BankAccountFragment).ach_default_memo}
                  </Box>
                </Box>
              </Box>
            )}
            <Box display="flex" alignItems="center" pt={0.5} pb={1}>
              <CheckCircle
                color={
                  (bankAccount as BankAccountFragment).can_wire
                    ? "primary"
                    : "disabled"
                }
              />
              <Box pl={1}>{"Wire?"}</Box>
            </Box>
            {!!(bankAccount as BankAccountFragment).can_wire && (
              <Box display="flex" flexDirection="column" pl={2}>
                <Box display="flex" alignItems="center" pt={0.5} pb={1}>
                  <CheckCircle
                    color={
                      (bankAccount as BankAccountFragment).is_wire_intermediary
                        ? "primary"
                        : "disabled"
                    }
                  />
                  <Box pl={1}>{"Is intermediary bank?"}</Box>
                </Box>
                {!!(bankAccount as BankAccountFragment)
                  .is_wire_intermediary && (
                  <Box display="flex" flexDirection="column" pl={2}>
                    <Box display="flex" pb={0.5}>
                      <Box className={classes.label}>
                        Intermediary Bank Name
                      </Box>
                      <Box>
                        {
                          (bankAccount as BankAccountFragment)
                            .intermediary_bank_name
                        }
                      </Box>
                    </Box>
                    <Box display="flex" pb={0.5}>
                      <Box className={classes.label}>
                        Intermediary Bank Address
                      </Box>
                      <Box>
                        {
                          (bankAccount as BankAccountFragment)
                            .intermediary_bank_address
                        }
                      </Box>
                    </Box>
                    <Box display="flex" pb={0.5}>
                      <Box className={classes.label}>
                        Intermediary Account Name
                      </Box>
                      <Box>
                        {
                          (bankAccount as BankAccountFragment)
                            .intermediary_account_name
                        }
                      </Box>
                    </Box>
                    <Box display="flex" pb={0.5}>
                      <Box className={classes.label}>
                        Intermediary Account Number
                      </Box>
                      <Box>
                        {isObfuscateEnabled
                          ? obfuscateBankNumbers(
                              bankAccount.intermediary_account_number || ""
                            )
                          : bankAccount.intermediary_account_number}
                      </Box>
                    </Box>
                  </Box>
                )}
                <Box display="flex" pb={0.5}>
                  <Box className={classes.label}>Wire Routing Number</Box>
                  <Box>
                    {isObfuscateEnabled
                      ? obfuscateBankNumbers(
                          bankAccount.wire_routing_number || ""
                        )
                      : bankAccount.wire_routing_number}
                  </Box>
                </Box>
                <Box display="flex" pb={0.5}>
                  <Box className={classes.label}>Recipient Address</Box>
                  <Box>
                    {(bankAccount as BankAccountFragment).recipient_address}
                  </Box>
                </Box>
                <Box display="flex" pb={0.5}>
                  <Box className={classes.label}>Recipient Address 2</Box>
                  <Box>
                    {(bankAccount as BankAccountFragment).recipient_address_2}
                  </Box>
                </Box>
                <Box display="flex" pb={0.5}>
                  <Box className={classes.label}>Wire Default Memo</Box>
                  <Box>
                    {(bankAccount as BankAccountFragment).wire_default_memo}
                  </Box>
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
                <Box pl={1}>{"Is cannabis compliant?"}</Box>
              </Box>
            )}
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
            <Box display="flex" pt={0.5}>
              <Button
                color="default"
                size="small"
                variant="outlined"
                onClick={() => setIsObfuscateEnabled(!isObfuscateEnabled)}
              >
                {isObfuscateEnabled ? "Reveal Numbers" : "Hide Numbers"}
              </Button>
            </Box>
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
      )}
    </>
  );
}
