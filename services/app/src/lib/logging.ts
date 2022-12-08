import { ApolloError } from "@apollo/client/errors";
import * as Sentry from "@sentry/browser";

export const logMessage = (message: string): void => {
  Sentry.captureMessage(message);
};

export enum GraphQLQueryTypes {
  Mutation = "mutation",
  Query = "query",
  Subscription = "subscription",
}

export const logGraphQLError = (
  err: ApolloError,
  queryType: GraphQLQueryTypes,
  queryName: string,
  variables: Record<string, any>
): void => {
  Sentry.withScope((scope) => {
    scope.setTag("kind", queryType);
    scope.setExtra("query", queryName);
    scope.setExtra("variables", variables);
    Sentry.captureException(err);
  });
};
