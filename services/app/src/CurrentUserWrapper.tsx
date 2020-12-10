import { CurrentUserContext, UserRole } from "contexts/CurrentUserContext";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

function CurrentUserWrapper(props: { children: React.ReactNode }) {
  const [role, setRole] = useState(UserRole.Customer);

  return (
    <CurrentUserContext.Provider
      value={{
        id: uuidv4(),
        role,
        setRole,
      }}
    >
      {props.children}
    </CurrentUserContext.Provider>
  );
}

export default CurrentUserWrapper;
