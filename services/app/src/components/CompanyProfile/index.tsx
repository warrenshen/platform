import { CurrentUserContext } from "contexts/CurrentUserContext";
import useAppBarTitle from "hooks/useAppBarTitle";
import { useContext } from "react";
import { useParams } from "react-router-dom";
import { useTitle } from "react-use";
import { useCompanyQuery } from "../../generated/graphql";
import BankAccounts from "./BankAccounts";
import CompanyInfo from "./CompanyInfo";

export interface CustomerParams {
  companyId: string;
}

function CompanyProfile() {
  useTitle("Company Profile | Bespoke");
  useAppBarTitle("Company Profile");
  const { companyId: companyIdFromParams } = useParams<CustomerParams>();
  const { user } = useContext(CurrentUserContext);

  const companyId = companyIdFromParams ? companyIdFromParams : user.companyId;

  const { data: companyData } = useCompanyQuery({
    variables: {
      companyId,
    },
  });

  if (!companyData?.companies_by_pk) {
    return null;
  }

  const company = companyData?.companies_by_pk;

  return (
    <>
      <CompanyInfo company={company}></CompanyInfo>
      <BankAccounts
        companyId={company.id}
        bankAccounts={company.bank_accounts}
      ></BankAccounts>
    </>
  );
}

export default CompanyProfile;
