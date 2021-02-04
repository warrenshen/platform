import Page from "components/Shared/Page";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import { UserRolesEnum } from "generated/graphql";
import useAppBarTitle from "hooks/useAppBarTitle";
import { useContext } from "react";
import { useTitle } from "react-use";
import BankDashboard from "./BankDashboard";

function Home() {
  useTitle("Overview | Bespoke");
  useAppBarTitle("Overview");

  const { user } = useContext(CurrentUserContext);

  return (
    <Page>
      {user.role === UserRolesEnum.BankAdmin ? (
        <BankDashboard />
      ) : (
        "Dashboard for CUSTOMER USER"
      )}
    </Page>
  );
}

export default Home;
