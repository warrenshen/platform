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
          "x-hasura-admin-secret":
            process.env.REACT_APP_BESPOKE_HASURA_ADMIN_SECRET,
        },
  });

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
              "x-hasura-admin-secret":
                process.env.REACT_APP_BESPOKE_HASURA_ADMIN_SECRET,
            },
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

  return new ApolloClient({
    link: ApolloLink.from([stripTypenameLink, transportLink]),
    cache: new InMemoryCache(),
    connectToDevTools: true,
  });
};

function ApolloWrapper(props: { children: React.ReactNode }) {
  const client = createApolloClient();
  return <ApolloProvider client={client}>{props.children}</ApolloProvider>;
}

export default ApolloWrapper;
