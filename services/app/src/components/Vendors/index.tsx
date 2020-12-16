import BankVendors from "components/Vendors/Bank";
import CustomerVendors from "components/Vendors/Customer";
import { CurrentUserContext, UserRole } from "contexts/CurrentUserContext";
import useAppBarTitle from "hooks/useAppBarTitle";
import { useContext } from "react";
import { useTitle } from "react-use";

function Vendors() {
  useTitle("Vendors | Bespoke");
  useAppBarTitle("Vendors");

  const currentUser = useContext(CurrentUserContext);

  return currentUser.role === UserRole.Bank ? (
    <BankVendors></BankVendors>
  ) : (
    <CustomerVendors></CustomerVendors>
  );
}

export default Vendors;
