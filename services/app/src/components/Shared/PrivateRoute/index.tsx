import {
  CurrentUserContext,
  isRoleBankUser,
} from "contexts/CurrentUserContext";
import {
  UserRolesEnum,
  useGetCompanyWithDetailsByCompanyIdQuery,
} from "generated/graphql";
import { ProductTypeEnum } from "lib/enum";
import { routes } from "lib/routes";
import { useContext, useEffect } from "react";
import { Redirect, Route, RouteProps } from "react-router-dom";

interface Props {
  requiredRoles: Array<UserRolesEnum>;
}

export default function PrivateRoute(props: Props & RouteProps) {
  const { children, component, ...rest } = props;
  const {
    user: { companyId, role },
    setUserProductType,
    isSignedIn,
  } = useContext(CurrentUserContext);

  const canVisitRoute =
    props.requiredRoles && !!role ? props.requiredRoles.includes(role) : false;

  const shouldRender = isSignedIn && canVisitRoute;

  const { data, error } = useGetCompanyWithDetailsByCompanyIdQuery({
    skip: companyId === null,
    variables: {
      companyId,
    },
  });

  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }

  const company = data?.companies_by_pk;

  useEffect(() => {
    if (!isRoleBankUser(role) && company?.contract?.product_type) {
      setUserProductType(company?.contract?.product_type as ProductTypeEnum);
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
