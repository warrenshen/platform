import { PageContext } from "contexts/PageContext";
import { useContext, useEffect } from "react";
import { useTitle } from "react-use";
import { useCompaniesQuery } from "../../generated/graphql";
function CompanyProfile() {
  useTitle("Company Profile | Bespoke");
  const pageContext = useContext(PageContext);

  useEffect(() => {
    pageContext.setAppBarTitle("Company Profile");
  }, []);

  const { data } = useCompaniesQuery();

  return <div>Profile for customer, {data?.companies[0]?.name}</div>;
}

export default CompanyProfile;
