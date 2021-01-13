import { Box } from "@material-ui/core";
import Can from "components/Can";
import AdvancesBank from "components/Shared/BespokeBankAssignment/AdvancesBank";
import CollectionsBank from "components/Shared/BespokeBankAssignment/CollectionsBank";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import { Action } from "lib/rbac-rules";
import { useContext } from "react";
import { useParams } from "react-router-dom";
import { useCompanyQuery } from "../../../generated/graphql";
import BankAccounts from "./BankAccounts";
import CompanyInfo from "./CompanyInfo";

export interface CustomerParams {
  companyId: string;
}

function CompanyProfile() {
  const { companyId: companyIdFromParams } = useParams<CustomerParams>();
  const { user } = useContext(CurrentUserContext);

  const companyId = companyIdFromParams ? companyIdFromParams : user.companyId;

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
    <>
      <CompanyInfo company={company}></CompanyInfo>
      <BankAccounts
        companyId={company.id}
        bankAccounts={company.bank_accounts}
      ></BankAccounts>
      <Can perform={Action.AssignBespokeBankAccountForCustomer}>
        <Box mt={2} display="flex">
          <AdvancesBank
            assignedBespokeBankAccount={
              data.companies_by_pk.advances_bespoke_bank_account || undefined
            }
          ></AdvancesBank>
          <CollectionsBank
            assignedBespokeBankAccount={
              data.companies_by_pk.collections_bespoke_bank_account || undefined
            }
          ></CollectionsBank>
        </Box>
      </Can>
    </>
  );
}

export default CompanyProfile;
