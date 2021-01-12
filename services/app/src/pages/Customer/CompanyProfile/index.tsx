import CompanyProfile from "components/Shared/CompanyProfile";
import useAppBarTitle from "hooks/useAppBarTitle";
import { useTitle } from "react-use";

function CompanyProfilePage() {
  useTitle("Company Profile | Bespoke");
  useAppBarTitle("Company Profile");

  return <CompanyProfile></CompanyProfile>;
}

export default CompanyProfilePage;
