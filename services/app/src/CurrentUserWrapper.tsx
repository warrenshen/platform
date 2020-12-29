import { ApolloClient, NormalizedCacheObject } from "@apollo/client";
import {
  CurrentUserContext,
  User,
  UserRole,
} from "contexts/CurrentUserContext";
import JwtDecode from "jwt-decode";
import { useCallback, useState } from "react";
import { authEndpoints } from "routes";

const blankUser = {
  id: "",
  companyId: "",
  role: UserRole.CompanyAdmin,
};

export const LOCAL_STORAGE_ACCESS_TOKEN_KEY = "access_token";

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
  const jwtToken = localStorage.getItem(LOCAL_STORAGE_ACCESS_TOKEN_KEY);
  const [user, setUser] = useState<User>(
    jwtToken ? decodeToken(jwtToken) : blankUser
  );

  const signIn = useCallback(async (email: string, password: string) => {
    const response = await fetch(authEndpoints.login, {
      method: "POST",
      mode: "cors",
      cache: "no-cache",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
    try {
      const data = await response.json();
      if (data.status === "OK") {
        localStorage.setItem(LOCAL_STORAGE_ACCESS_TOKEN_KEY, data.access_token);
        setUser(decodeToken(data.access_token));
      }
    } catch {
      setUser(blankUser);
    }
  }, []);

  const signOut = useCallback((client: ApolloClient<NormalizedCacheObject>) => {
    localStorage.removeItem(LOCAL_STORAGE_ACCESS_TOKEN_KEY);
    client.clearStore();
    setUser(blankUser);
  }, []);

  return (
    <CurrentUserContext.Provider
      value={{
        user,
        jwtToken,
        signIn,
        signOut,
      }}
    >
      {props.children}
    </CurrentUserContext.Provider>
  );
}

export default CurrentUserWrapper;
