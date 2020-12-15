FROM hasura/graphql-engine:v1.3.3.cli-migrations-v2

COPY services/prototype-server/migrations /hasura-migrations
COPY services/prototype-server/metadata /hasura-metadata

CMD graphql-engine \
    --database-url $HASURA_GRAPHQL_DATABASE_URL \
    serve \
    --server-port $PORT \
    --enabled-log-types "startup,http-log,webhook-log,websocket-log,query-log"
