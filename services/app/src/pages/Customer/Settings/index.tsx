import Page from "components/Shared/Page";
import Settings from "components/Shared/Settings";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  CompanySettingsForCustomerFragment,
  ContractFragment,
  useCompanyForCustomerQuery,
} from "generated/graphql";
import React, { useContext } from "react";
import { useParams } from "react-router-dom";

export interface CustomerParams {
  companyId: string;
}

function SettingsPage() {
  const { companyId: companyIdFromParams } = useParams<CustomerParams>();
  const { user } = useContext(CurrentUserContext);
  const companyId = companyIdFromParams || user.companyId;

  const { data, refetch } = useCompanyForCustomerQuery({
    variables: {
      companyId,
    },
  });

  if (!data || !data?.companies_by_pk) {
    return null;
  }

  const settings = data?.companies_by_pk
    ?.settings as CompanySettingsForCustomerFragment;
  const contract = data?.companies_by_pk?.contract as ContractFragment;

  return (
    <Page appBarTitle={"Settings"}>
      <Settings
        companyId={companyId}
        settings={settings}
        contract={contract}
        bankAccounts={data?.companies_by_pk?.bank_accounts || []}
        handleDataChange={() => refetch()}
      />
    </Page>
  );
}

export default SettingsPage;
