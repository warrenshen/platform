import Customer from "components/Bank/Customer";
import Customers from "components/Bank/Customers";
import CompanyProfile from "components/CompanyProfile";
import Home from "components/Home";
import Layout from "components/Layout";
import Loans from "components/Loans";
import PurchaseOrders from "components/PurchaseOrders";
import SignIn from "components/SignIn";
import UserProfile from "components/UserProfile";
import Users from "components/Users";
import Vendors from "components/Vendors";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import BankAccounts from "pages/Bank/BankAccounts";
import { useContext } from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { bankPaths, routes } from "routes";
import "./App.css";

function App() {
  const { user } = useContext(CurrentUserContext);

  if (!user.id) return <SignIn />;

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
          <Route path={routes.userProfile} component={UserProfile}></Route>
          <Route path={routes.users} component={Users}></Route>

          <Route exact path={bankPaths.customers} component={Customers}></Route>
          <Route path={bankPaths.customer.root} component={Customer}></Route>
          <Route
            exact
            path={bankPaths.bankAccounts}
            component={BankAccounts}
          ></Route>
        </Switch>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
