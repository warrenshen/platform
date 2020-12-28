import {
  CurrentUserContext,
  User,
  UserRole,
} from "contexts/CurrentUserContext";
import JwtDecode from "jwt-decode";
import { useEffect, useState } from "react";

const blankUser = {
  id: "",
  companyId: "",
  role: UserRole.CompanyAdmin,
};

function decodeToken(jwtToken: string) {
  const decodedJwtToken: any = JwtDecode(jwtToken);
  const claims = decodedJwtToken["https://hasura.io/jwt/claims"];
  return {
    id: claims["X-Hasura-User-Id"],
    companyId: claims["X-Hasura-Company-Id"],
    role: claims["X-Hasura-Default-Role"],
  };
}

function CurrentUserWrapper(props: { children: React.ReactNode }) {
  const jwtToken = localStorage.getItem("access_token");
  const [signedIn, setSignedIn] = useState(!!jwtToken);
  const [user, setUser] = useState<User>(
    jwtToken ? decodeToken(jwtToken) : blankUser
  );

  useEffect(() => {
    if (jwtToken) {
      setUser(decodeToken(jwtToken));
    } else {
      setUser(blankUser);
    }
  }, [signedIn, jwtToken]);

  return (
    <CurrentUserContext.Provider
      value={{
        user,
        setSignedIn,
      }}
    >
      {props.children}
    </CurrentUserContext.Provider>
  );
}

export default CurrentUserWrapper;
