import { useTitle } from "react-use";
import { useCompaniesQuery } from "../../generated/graphql";
function CompanyProfile() {
  useTitle("Profile | Bespoke");
  const { data } = useCompaniesQuery();

  return <div>Company Profile for customer, {data?.companies[0].name}</div>;
}

export default CompanyProfile;
