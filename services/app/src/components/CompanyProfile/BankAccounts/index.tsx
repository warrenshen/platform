import {
  Box,
  Button,
  Card,
  CardContent,
  createStyles,
  makeStyles,
  Theme,
} from "@material-ui/core";
import AccountForm from "components/Shared/BankAccount/AccountForm";
import AccountInfo from "components/Shared/BankAccount/AccountInfo";
import { BankAccountFragment } from "generated/graphql";
import { useEffect, useState } from "react";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    card: {
      marginRight: theme.spacing(2),
      marginTop: theme.spacing(2),
    },
    addAccountButton: {
      marginTop: theme.spacing(2),
    },
  })
);

interface Props {
  companyId: string;
  bankAccounts: BankAccountFragment[];
}

function BankAccounts({ companyId, bankAccounts }: Props) {
  const classes = useStyles();
  const [accounts, setAccounts] = useState(
    bankAccounts.map((bankAccount) => {
      return { addNew: false, bankAccount: bankAccount };
    })
  );

  useEffect(() => {
    setAddingNewAccount(false);
    setAccounts(
      bankAccounts.map((bankAccount) => {
        return { addNew: false, bankAccount: bankAccount };
      })
    );
  }, [bankAccounts]);

  const [addingNewAccount, setAddingNewAccount] = useState(false);

  return (
    <>
      <Button
        disabled={addingNewAccount}
        className={classes.addAccountButton}
        onClick={() => {
          setAddingNewAccount(true);
          setAccounts((current) => [
            { addNew: true, bankAccount: {} as BankAccountFragment },
            ...current,
          ]);
        }}
        color="primary"
        variant="contained"
      >
        Add Bank Account
      </Button>
      <Box display="flex">
        {accounts.map((account, index) => (
          <Card key={index} className={classes.card}>
            <CardContent>
              <Box mb={3}>
                {account && account.addNew && (
                  <AccountForm
                    companyId={companyId}
                    bankAccount={undefined}
                    onCancel={() => {
                      setAccounts([...accounts.slice(1)]);
                      setAddingNewAccount(false);
                    }}
                  ></AccountForm>
                )}
                {account && !account.addNew && (
                  <AccountInfo bankAccount={account.bankAccount}></AccountInfo>
                )}
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    </>
  );
}

export default BankAccounts;
