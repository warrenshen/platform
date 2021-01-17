import { CurrentUserContext, UserRole } from "contexts/CurrentUserContext";
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
        user.role === UserRole.BankAdmin ? "BANK USER" : "CUSTOMER USER"
      }`}
    </div>
  );
}

export default Home;
