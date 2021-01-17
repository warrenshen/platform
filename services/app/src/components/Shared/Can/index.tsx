import { CurrentUserContext } from "contexts/CurrentUserContext";
import { Action, check } from "lib/auth/rbac-rules";
import { useContext } from "react";

interface Props {
  perform: Action;
  children: React.ReactNode;
  userIdForCheck?: string;
}

function Can(props: Props) {
  const { user, signedIn } = useContext(CurrentUserContext);

  if (!signedIn) {
    return null;
  }

  const data = props.userIdForCheck
    ? { currentUserId: user.id, userIdForCheck: props.userIdForCheck }
    : undefined;

  if (check(user.role, props.perform, data)) {
    return <>{props.children}</>;
  }

  return null;
}

export default Can;
