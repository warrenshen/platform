import Layout from "components/Shared/Layout";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import { bankPaths, routes } from "lib/routes";
import BankAccounts from "pages/Bank/BankAccounts";
import Customer from "pages/Bank/Customer";
import Customers from "pages/Bank/Customers";
import CompanyProfilePage from "pages/Customer/CompanyProfile";
import LoansPage from "pages/Customer/Loans";
import PurchaseOrdersPage from "pages/Customer/PurchaseOrders";
import Home from "pages/Home";
import SignIn from "pages/SignIn";
import UserProfile from "pages/UserProfile";
import Users from "pages/Users";
import Vendors from "pages/Vendors";
import { useContext } from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";

function App() {
  const { user } = useContext(CurrentUserContext);

  if (!user.id) return <SignIn />;

  return (
    <BrowserRouter>
      <Layout>
        <Switch>
          <Route exact path={routes.root} component={Home}></Route>
          <Route exact path={routes.overview} component={Home}></Route>
          <Route exact path={routes.loans} component={LoansPage}></Route>
          <Route
            exact
            path={routes.purchaseOrders}
            component={PurchaseOrdersPage}
          ></Route>
          <Route exact path={routes.vendors} component={Vendors}></Route>
          <Route
            exact
            path={routes.profile}
            component={CompanyProfilePage}
          ></Route>
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
