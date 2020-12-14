import BankVendors from "components/Vendors/Bank";
import CustomerVendors from "components/Vendors/Customer";
import { CurrentUserContext, UserRole } from "contexts/CurrentUserContext";
import { PageContext } from "contexts/PageContext";
import { useContext, useEffect } from "react";
import { useTitle } from "react-use";

function Vendors() {
  useTitle("Vendors | Bespoke");
  const pageContext = useContext(PageContext);

  useEffect(() => {
    pageContext.setAppBarTitle("Vendors");
  }, []);

  const currentUser = useContext(CurrentUserContext);

  return currentUser.role === UserRole.Bank ? (
    <BankVendors></BankVendors>
  ) : (
    <CustomerVendors></CustomerVendors>
  );
}

export default Vendors;
