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
  const { companyId } = useParams<CustomerParams>();
  const { company_id: currentUserCompanyId } = useContext(CurrentUserContext);

  const { data: companyData, loading: companyLoading } = useCompanyQuery({
    variables: {
      companyId: companyId ? companyId : currentUserCompanyId,
    },
  });

  if (!companyData?.companies_by_pk) {
    return null;
  }

  const company = companyData?.companies_by_pk;

  if (companyLoading) {
    return <p>Loading...</p>;
  }

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
