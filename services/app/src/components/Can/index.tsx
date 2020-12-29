import { CurrentUserContext } from "contexts/CurrentUserContext";
import { Action, check } from "lib/rbac-rules";
import { useContext } from "react";

interface Props {
  perform: Action;
  children: React.ReactNode;
}

function Can(props: Props) {
  const { user } = useContext(CurrentUserContext);
  const isAuthenticated = !!user.id;

  if (!isAuthenticated) {
    return null;
  }

  if (check(user.role, props.perform)) {
    return <>{props.children}</>;
  }

  return null;
}

export default Can;
