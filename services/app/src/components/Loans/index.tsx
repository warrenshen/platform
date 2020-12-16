import useAppBarTitle from "hooks/useAppBarTitle";
import { useTitle } from "react-use";

function Loans() {
  useTitle("Loans | Bespoke");
  useAppBarTitle("Loans");

  return <div>Loans for customer</div>;
}

export default Loans;
