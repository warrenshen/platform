import { CurrentUserContext } from "contexts/CurrentUserContext";
import { UserRolesEnum } from "generated/graphql";
import { routes } from "lib/routes";
import { useContext } from "react";
import { Redirect, Route, RouteProps } from "react-router-dom";

interface Props {
  requiredRoles: Array<UserRolesEnum>;
}

function PrivateRoute(props: Props & RouteProps) {
  const { children, component, ...rest } = props;
  const {
    user: { role },
    isSignedIn,
  } = useContext(CurrentUserContext);

  const canVisitRoute = props.requiredRoles
    ? props.requiredRoles.includes(role)
    : false;

  const shouldRender = isSignedIn && canVisitRoute;

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
          ></Redirect>
        )
      }
    ></Route>
  );
}

export default PrivateRoute;
