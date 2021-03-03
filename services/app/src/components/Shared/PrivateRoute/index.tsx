import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  useCompanyWithDetailsByCompanyIdQuery,
  UserRolesEnum,
} from "generated/graphql";
import { routes } from "lib/routes";
import { useContext, useEffect } from "react";
import { Redirect, Route, RouteProps } from "react-router-dom";

interface Props {
  requiredRoles: Array<UserRolesEnum>;
}

function PrivateRoute(props: Props & RouteProps) {
  const { children, component, ...rest } = props;
  const {
    user: { companyId, role },
    setUserProductType,
    isSignedIn,
  } = useContext(CurrentUserContext);

  const canVisitRoute = props.requiredRoles
    ? props.requiredRoles.includes(role)
    : false;

  const shouldRender = isSignedIn && canVisitRoute;

  const { data } = useCompanyWithDetailsByCompanyIdQuery({
    skip: companyId === null,
    variables: {
      companyId,
    },
  });

  const company = data?.companies_by_pk;

  useEffect(() => {
    if (role !== UserRolesEnum.BankAdmin && company?.contract?.product_type) {
      setUserProductType(company?.contract?.product_type);
    }
  }, [role, company?.contract?.product_type, setUserProductType]);

  return (
    <Route
      {...rest}
      render={({ location }) =>
        shouldRender ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: routes.signIn,
              state: {
                from: canVisitRoute ? location : routes.root,
              },
            }}
          />
        )
      }
    />
  );
}

export default PrivateRoute;
