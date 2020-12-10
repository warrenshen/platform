import {
  ApolloClient,
  ApolloProvider,
  HttpLink,
  InMemoryCache,
  split,
} from "@apollo/client";
import { WebSocketLink } from "@apollo/client/link/ws";
import { getMainDefinition } from "@apollo/client/utilities";

const createApolloClient = () => {
  const jwtToken = false;
  const httpLink = new HttpLink({
    uri: process.env.REACT_APP_BESPOKE_GRAPHQL_ENDPOINT,
    credentials: "include",
    headers: jwtToken
      ? {
          Authorization: `Bearer ${jwtToken}`,
          "X-Hasura-Role": "FILL_ME_IN",
        }
      : {
          "x-hasura-admin-secret": "myadminsecretkey",
        },
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
              "X-Hasura-Role": "FILL_ME_IN",
            }
          : {
              "x-hasura-admin-secret": "myadminsecretkey",
            },
      },
    },
  });

  const link = split(
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

  return new ApolloClient({
    link: link,
    cache: new InMemoryCache(),
    connectToDevTools: true,
  });
};

function ApolloWrapper(props: { children: React.ReactNode }) {
  const client = createApolloClient();
  return <ApolloProvider client={client}>{props.children}</ApolloProvider>;
}

export default ApolloWrapper;
