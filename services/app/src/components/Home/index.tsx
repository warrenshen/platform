import { PageContext } from "contexts/PageContext";
import { useContext, useEffect } from "react";
import { useTitle } from "react-use";

function Home() {
  useTitle("Overview | Bespoke");
  const pageContext = useContext(PageContext);

  useEffect(() => {
    pageContext.setAppBarTitle("Overview");
  }, []);

  return <div>Dashboard for customer</div>;
}

export default Home;
