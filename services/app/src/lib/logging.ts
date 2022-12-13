import { ApolloError } from "@apollo/client/errors";
import * as Sentry from "@sentry/browser";

export const logMessage = (message: string): void => {
  Sentry.captureMessage(message);
};

enum GraphQLQueryTypes {
  Mutation = "mutation",
  Query = "query",
  Subscription = "subscription",
}

const logGraphQLError = (
  apolloErorr: ApolloError,
  queryType: GraphQLQueryTypes,
  queryName: string,
  variables: Record<string, any>
): void => {
  Sentry.withScope((scope) => {
    scope.setTag("kind", queryType);
    scope.setExtra("query", queryName);
    scope.setExtra("variables", variables);
    Sentry.captureException(apolloErorr);
  });
};

export const logGraphQLQueryError = (
  apolloErorr: ApolloError,
  queryName: string,
  queryVariables: Record<string, any>
): void => {
  logGraphQLError(
    apolloErorr,
    GraphQLQueryTypes.Query,
    queryName,
    queryVariables
  );
};
