import { CurrentUserContext } from "contexts/CurrentUserContext";
import { UserRolesEnum } from "generated/graphql";
import useAppBarTitle from "hooks/useAppBarTitle";
import { useContext } from "react";
import { useTitle } from "react-use";

function Home() {
  useTitle("Overview | Bespoke");
  useAppBarTitle("Overview");

  const { user } = useContext(CurrentUserContext);

  return (
    <div>
      {`Dashboard for ${
        user.role === UserRolesEnum.BankAdmin ? "BANK USER" : "CUSTOMER USER"
      }`}
    </div>
  );
}

export default Home;
