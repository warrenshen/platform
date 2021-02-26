import { CurrentUserContext } from "contexts/CurrentUserContext";
import { Action, check } from "lib/auth/rbac-rules";
import { ReactNode, useContext } from "react";

interface Props {
  perform: Action;
  children: ReactNode;
  userIdForCheck?: string;
}

function Can(props: Props) {
  const {
    user: { id, role },
    isSignedIn,
  } = useContext(CurrentUserContext);

  if (!isSignedIn) {
    return null;
  }

  const data = props.userIdForCheck
    ? { currentUserId: id, userIdForCheck: props.userIdForCheck }
    : undefined;

  if (check(role, props.perform, data)) {
    return <>{props.children}</>;
  }

  return null;
}

export default Can;
