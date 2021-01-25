import Settings from "components/Shared/Settings";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  CompanySettingsForCustomerFragment,
  useCompanyForCustomerQuery,
} from "generated/graphql";
import useAppBarTitle from "hooks/useAppBarTitle";
import React, { useContext } from "react";
import { useParams } from "react-router-dom";
import { useTitle } from "react-use";

export interface CustomerParams {
  companyId: string;
}

function SettingsPage() {
  useTitle("Settings | Bespoke");
  useAppBarTitle("Settings");

  const { companyId: companyIdFromParams } = useParams<CustomerParams>();
  const { user } = useContext(CurrentUserContext);
  const companyId = companyIdFromParams || user.companyId;

  const { data } = useCompanyForCustomerQuery({
    variables: {
      companyId,
    },
  });

  if (!data || !data?.companies_by_pk) {
    return null;
  }

  const settings = data?.companies_by_pk
    ?.settings as CompanySettingsForCustomerFragment;

  return (
    <Settings
      settings={settings}
      bankAccounts={data?.companies_by_pk?.bank_accounts || []}
    ></Settings>
  );
}

export default SettingsPage;
