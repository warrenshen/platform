FROM hasura/graphql-engine:v2.3.1.cli-migrations-v3

ENV HASURA_GRAPHQL_CLI_ENVIRONMENT=default
ENV HASURA_RUN_MIGRATIONS="true"

CMD graphql-engine \
    --database-url $DATABASE_URL \
    serve \
    --server-port $PORT
