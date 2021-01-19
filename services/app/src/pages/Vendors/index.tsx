import BankVendors from "components/Vendors/Bank";
import CustomerVendors from "components/Vendors/Customer";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import { UserRolesEnum } from "generated/graphql";
import useAppBarTitle from "hooks/useAppBarTitle";
import { useContext } from "react";
import { useTitle } from "react-use";

function Vendors() {
  useTitle("Vendors | Bespoke");
  useAppBarTitle("Vendors");

  const {
    user: { role },
  } = useContext(CurrentUserContext);

  return role === UserRolesEnum.BankAdmin ? (
    <BankVendors></BankVendors>
  ) : (
    <CustomerVendors></CustomerVendors>
  );
}

export default Vendors;
