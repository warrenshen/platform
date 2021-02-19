import CompanyInfo from "components/Shared/CompanyProfile/CompanyInfo";
import Page from "components/Shared/Page";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import { useCompanyForCustomerQuery } from "generated/graphql";
import { useContext } from "react";

function CustomerCompanyProfilePage() {
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
    <Page appBarTitle={"Company Profile"}>
      <CompanyInfo company={company} />
    </Page>
  ) : null;
}

export default CustomerCompanyProfilePage;
