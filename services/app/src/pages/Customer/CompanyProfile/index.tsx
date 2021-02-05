import CompanyInfo from "components/Shared/CompanyProfile/CompanyInfo";
import Page from "components/Shared/Page";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import { useCompanyForCustomerQuery } from "generated/graphql";
import useAppBarTitle from "hooks/useAppBarTitle";
import { useContext } from "react";
import { useTitle } from "react-use";

function CustomerCompanyProfilePage() {
  useTitle("Company Profile | Bespoke");
  useAppBarTitle("Company Profile");

  const {
    user: { companyId },
  } = useContext(CurrentUserContext);

  const { data } = useCompanyForCustomerQuery({
    variables: {
      companyId,
    },
  });

  const company = data?.companies_by_pk;

  return company ? (
    <Page>
      <CompanyInfo company={company}></CompanyInfo>
    </Page>
  ) : null;
}

export default CustomerCompanyProfilePage;
