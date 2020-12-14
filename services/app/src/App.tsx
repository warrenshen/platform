import CompanyProfile from "components/CompanyProfile";
import Home from "components/Home";
import Layout from "components/Layout";
import Loans from "components/Loans";
import PurchaseOrders from "components/PurchaseOrders";
import Vendors from "components/Vendors";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { bankRoutes, routes } from "routes";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Switch>
          <Route exact path={routes.root} component={Home}></Route>
          <Route exact path={routes.overview} component={Home}></Route>
          <Route exact path={routes.loans} component={Loans}></Route>
          <Route
            exact
            path={routes.purchaseOrders}
            component={PurchaseOrders}
          ></Route>
          <Route exact path={routes.vendors} component={Vendors}></Route>
          <Route exact path={routes.profile} component={CompanyProfile}></Route>
          <Route exact path={bankRoutes.customers} component={Home}></Route>
        </Switch>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
