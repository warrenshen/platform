import {
  ApolloClient,
  ApolloLink,
  ApolloProvider,
  HttpLink,
  InMemoryCache,
  split,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { WebSocketLink } from "@apollo/client/link/ws";
import { getMainDefinition } from "@apollo/client/utilities";
import { CurrentUserContext, User } from "contexts/CurrentUserContext";
import { UserRolesEnum } from "generated/graphql";
import { getAccessToken } from "lib/auth/tokenStorage";
import { ReactNode, useContext } from "react";

const createApolloClient = (user: User) => {
  const authLink = setContext(async (_, { headers }) => {
    const accessToken = await getAccessToken();
    // accessToken will be available for authenticated user
    const header = !!accessToken
      ? {
          headers: {
            ...headers,
            Authorization: `Bearer ${accessToken}`,
            "X-Hasura-Role": user.role,
          },
        }
      : {
          headers: {
            ...headers,
            "X-Hasura-Role": UserRolesEnum.Anonymous,
          },
        };
    return header;
  });

  const httpLink = new HttpLink({
    uri: process.env.REACT_APP_BESPOKE_GRAPHQL_ENDPOINT,
    credentials: "include",
  });

  const wsLink = new WebSocketLink({
    uri: process.env.REACT_APP_BESPOKE_WS_GRAPHQL_ENDPOINT || "",
    options: {
      lazy: true,
      reconnect: true,
      connectionParams: async () => {
        const accessToken = await getAccessToken();
        return {
          headers: accessToken
            ? {
                Authorization: `Bearer ${accessToken}`,
                "X-Hasura-Role": user.role,
              }
            : undefined,
        };
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

  const client = new ApolloClient({
    link: ApolloLink.from([stripTypenameLink, authLink, transportLink]),
    cache: new InMemoryCache({
      typePolicies: {
        purchase_order_loan_payments: {
          keyFields: ["purchase_order_loan_id", "payment_id"],
        },
        purchase_order_files: {
          keyFields: ["purchase_order_id", "file_id"],
        },
      },
    }),
    connectToDevTools: true,
  });

  return client;
};

function ApolloClientProvider(props: { children: ReactNode }) {
  const { user } = useContext(CurrentUserContext);
  const client = createApolloClient(user);
  return <ApolloProvider client={client}>{props.children}</ApolloProvider>;
}

export default ApolloClientProvider;
