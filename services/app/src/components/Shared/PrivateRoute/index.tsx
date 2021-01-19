import { CurrentUserContext } from "contexts/CurrentUserContext";
import { UserRolesEnum } from "generated/graphql";
import { routes } from "lib/routes";
import { useContext } from "react";
import { Redirect, Route, RouteProps } from "react-router-dom";

interface Props {
  requiredRoles?: Array<UserRolesEnum>;
}

function PrivateRoute(props: Props & RouteProps) {
  const { children, component, ...rest } = props;
  const {
    user: { role },
    signedIn,
  } = useContext(CurrentUserContext);

  const canVisitRoute = props.requiredRoles
    ? props.requiredRoles.includes(role)
    : true;

  const shouldRender = signedIn && canVisitRoute;

  return (
    <Route
      {...rest}
      render={({ location }) => {
        const fromLocation = canVisitRoute ? location : routes.root;

        return shouldRender ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: routes.signIn,
              state: {
                from: fromLocation,
              },
            }}
          ></Redirect>
        );
      }}
    ></Route>
  );
}

export default PrivateRoute;
