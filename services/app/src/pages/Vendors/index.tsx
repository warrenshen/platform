import BankVendors from "components/Vendors/Bank";
import CustomerVendors from "components/Vendors/Customer";
import { CurrentUserContext, UserRole } from "contexts/CurrentUserContext";
import useAppBarTitle from "hooks/useAppBarTitle";
import { useContext } from "react";
import { useTitle } from "react-use";

function Vendors() {
  useTitle("Vendors | Bespoke");
  useAppBarTitle("Vendors");

  const {
    user: { role },
  } = useContext(CurrentUserContext);

  return role === UserRole.BankAdmin ? (
    <BankVendors></BankVendors>
  ) : (
    <CustomerVendors></CustomerVendors>
  );
}

export default Vendors;
