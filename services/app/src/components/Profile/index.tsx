import { useTitle } from "react-use";
import { useCompaniesQuery } from "../../generated/graphql";
function Profile() {
  useTitle("Profile | Bespoke");
  const { data } = useCompaniesQuery();

  return <div>Profile for customer, {data?.companies[0].name}</div>;
}

export default Profile;
