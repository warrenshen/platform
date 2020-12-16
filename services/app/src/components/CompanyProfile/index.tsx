import useAppBarTitle from "hooks/useAppBarTitle";
import { useTitle } from "react-use";
import { useCompaniesQuery } from "../../generated/graphql";
function CompanyProfile() {
  useTitle("Company Profile | Bespoke");
  useAppBarTitle("Company Profile");

  const { data } = useCompaniesQuery();

  return <div>Profile for customer, {data?.companies[0]?.name}</div>;
}

export default CompanyProfile;
