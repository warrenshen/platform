import {
  ApolloClient,
  ApolloLink,
  ApolloProvider,
  HttpLink,
  InMemoryCache,
  split,
} from "@apollo/client";
import { WebSocketLink } from "@apollo/client/link/ws";
import { getMainDefinition } from "@apollo/client/utilities";
import { CurrentUserContext, User } from "contexts/CurrentUserContext";
import { useContext } from "react";

const createApolloClient = (user: User, jwtToken: string | null) => {
  const httpLink = new HttpLink({
    uri: process.env.REACT_APP_BESPOKE_GRAPHQL_ENDPOINT,
    credentials: "include",
    headers: jwtToken
      ? {
          Authorization: `Bearer ${jwtToken}`,
          "X-Hasura-Role": user.role,
        }
      : undefined,
  });

  const wsLink = new WebSocketLink({
    uri: process.env.REACT_APP_BESPOKE_WS_GRAPHQL_ENDPOINT || "",
    options: {
      lazy: true,
      reconnect: true,
      connectionParams: {
        headers: jwtToken
          ? {
              Authorization: `Bearer ${jwtToken}`,
              "X-Hasura-Role": user.role,
            }
          : undefined,
      },
    },
  });

  const transportLink = split(
    ({ query }) => {
      const definition = getMainDefinition(query);
      return (
        definition.kind === "OperationDefinition" &&
        definition.operation === "subscription"
      );
    },
    wsLink,
    httpLink
  );

  const stripTypenameLink = new ApolloLink((operation, forward) => {
    const omitTypename = (key: string, value: any): boolean => {
      return key === "__typename" ? undefined : value;
    };
    if (operation.variables) {
      operation.variables = JSON.parse(
        JSON.stringify(operation.variables),
        omitTypename
      );
    }
    return forward(operation);
  });

  return new ApolloClient({
    link: ApolloLink.from([stripTypenameLink, transportLink]),
    cache: new InMemoryCache(),
    connectToDevTools: true,
  });
};

function ApolloWrapper(props: { children: React.ReactNode }) {
  const { user, jwtToken } = useContext(CurrentUserContext);
  const client = createApolloClient(user, jwtToken);
  return <ApolloProvider client={client}>{props.children}</ApolloProvider>;
}

export default ApolloWrapper;
