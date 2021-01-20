import { Box } from "@material-ui/core";
import AdvancesBank from "components/Shared/BespokeBankAssignment/AdvancesBank";
import CollectionsBank from "components/Shared/BespokeBankAssignment/CollectionsBank";
import Can from "components/Shared/Can";
import BankAccounts from "components/Shared/CompanyProfile/BankAccounts";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import useAppBarTitle from "hooks/useAppBarTitle";
import { Action } from "lib/auth/rbac-rules";
import { useContext } from "react";
import { useParams } from "react-router-dom";
import { useTitle } from "react-use";
import { useCompanyQuery } from "../../../generated/graphql";

export interface CustomerParams {
  companyId: string;
}

function Settings() {
  useTitle("Settings | Bespoke");
  useAppBarTitle("Settings");

  const { companyId: companyIdFromParams } = useParams<CustomerParams>();
  const { user } = useContext(CurrentUserContext);

  const companyId = companyIdFromParams || user.companyId;

  const { data } = useCompanyQuery({
    variables: {
      companyId,
    },
  });

  if (!data || !data?.companies_by_pk) {
    return null;
  }

  const company = data?.companies_by_pk;

  return (
    <div>
      <BankAccounts
        companyId={company.id}
        bankAccounts={company.bank_accounts}
      ></BankAccounts>
      <Can perform={Action.AssignBespokeBankAccountForCustomer}>
        <Box mt={2} display="flex">
          <AdvancesBank
            companyId={company.id}
            assignedBespokeBankAccount={
              data.companies_by_pk.advances_bespoke_bank_account || undefined
            }
          ></AdvancesBank>
          <CollectionsBank
            companyId={company.id}
            assignedBespokeBankAccount={
              data.companies_by_pk.collections_bespoke_bank_account || undefined
            }
          ></CollectionsBank>
        </Box>
      </Can>
    </div>
  );
}

export default Settings;
