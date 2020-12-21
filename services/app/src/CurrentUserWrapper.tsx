import {
  CurrentUserContext,
  CurrentUserContextType,
  UserRole,
} from "contexts/CurrentUserContext";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

function CurrentUserWrapper(props: { children: React.ReactNode }) {
  const [role, setRole] = useState(UserRole.Customer);
  const [isAuthenticated, setAuthentication] = useState(false);

  return (
    <CurrentUserContext.Provider
      value={
        {
          id: uuidv4(),
          company_id: "57ee8797-1d5b-4a90-83c9-84c740590e42",
          role,
          setRole,
          isAuthenticated,
          setAuthentication,
        } as CurrentUserContextType
      }
    >
      {props.children}
    </CurrentUserContext.Provider>
  );
}

export default CurrentUserWrapper;
