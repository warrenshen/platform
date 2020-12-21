import { Box, Button } from "@material-ui/core";
import { CompanyBankAccountFragment } from "generated/graphql";
import { ActionType } from "lib/ActionType";
import { useState } from "react";
import BankAccountInfo from "./BankAccountInfo";
import EditBankAccountModal from "./EditBankAccount/EditBankAccountModal";

interface Params {
  companyId: string;
  bankAccounts: CompanyBankAccountFragment[];
}

function BankAccounts({ companyId, bankAccounts }: Params) {
  const [open, setOpen] = useState(false);
  const [actionType, setActionType] = useState(ActionType.New);
  const [currentBankAccount, setCurrentBankAccount] = useState(
    {} as CompanyBankAccountFragment
  );
  return (
    <>
      {" "}
      {open && (
        <EditBankAccountModal
          actionType={actionType}
          bankAccount={currentBankAccount}
          handleClose={() => setOpen(false)}
        ></EditBankAccountModal>
      )}
      <Box m={2}>
        <Button
          onClick={() => {
            setCurrentBankAccount({
              company_id: companyId,
            } as CompanyBankAccountFragment);
            setActionType(ActionType.New);
            setOpen(true);
          }}
          color="primary"
          variant="contained"
        >
          Add Bank Account
        </Button>
      </Box>
      <Box display="flex">
        {bankAccounts.map((bankAccount) => (
          <BankAccountInfo
            actionType={actionType}
            setActionType={setActionType}
            key={bankAccount.id}
            bankAccount={bankAccount}
            open={open}
            setOpen={setOpen}
            setCurrentBankAccount={setCurrentBankAccount}
          ></BankAccountInfo>
        ))}
      </Box>
    </>
  );
}

export default BankAccounts;
