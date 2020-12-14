import { PageContext } from "contexts/PageContext";
import { useContext, useEffect } from "react";
import { useTitle } from "react-use";

function Loans() {
  useTitle("Loans | Bespoke");

  const pageContext = useContext(PageContext);

  useEffect(() => {
    pageContext.setAppBarTitle("Loans");
  }, []);

  return <div>Loans for customer</div>;
}

export default Loans;
