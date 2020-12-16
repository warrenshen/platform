import useAppBarTitle from "hooks/useAppBarTitle";
import { useTitle } from "react-use";

function Home() {
  useTitle("Overview | Bespoke");
  useAppBarTitle("Overview");

  return <div>Dashboard for customer</div>;
}

export default Home;
