import { useTitle } from "react-use";
import { useCompaniesQuery } from "../../generated/graphql";
function CompanyProfile() {
  useTitle("Profile | Bespoke");
  const { data } = useCompaniesQuery();

<<<<<<< HEAD:services/app/src/components/Profile/index.tsx
  return <div>Profile for customer, {data?.companies[0]?.name}</div>;
=======
  return <div>Company Profile for customer, {data?.companies[0].name}</div>;
>>>>>>> 08db546747970742f6c5f40021ae75e5399a40c5:services/app/src/components/CompanyProfile/index.tsx
}

export default CompanyProfile;
