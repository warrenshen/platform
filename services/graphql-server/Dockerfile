FROM hasura/graphql-engine:v2.3.1.cli-migrations-v3

ENV HASURA_GRAPHQL_CLI_ENVIRONMENT=default
ENV HASURA_RUN_MIGRATIONS="true"

RUN mkdir /hasura-migrations && mkdir /hasura-metadata && mkdir /.hasura && mkdir -p /tmp/plugins-downloads/cli-ext
COPY migrations /hasura-migrations
COPY metadata /hasura-metadata
RUN chmod -R 777 /tmp /.hasura /hasura-migrations /hasura-metadata /tmp/plugins-downloads/cli-ext

CMD graphql-engine \
    --database-url $DATABASE_URL \
    serve \
    --server-port $PORT
