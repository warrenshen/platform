# https://github.com/hasura/graphql-engine/issues/4651#issuecomment-637506254
FROM hasura/graphql-engine:v1.3.3.cli-migrations-v2

ENV HASURA_GRAPHQL_CLI_ENVIRONMENT=default

RUN mkdir /hasura-migrations && mkdir /hasura-metadata && mkdir /.hasura && mkdir -p /tmp/plugins-downloads/cli-ext
COPY migrations /hasura-migrations
COPY metadata /hasura-metadata

COPY docker-entrypoint.sh /bin/
RUN chmod +x /bin/docker-entrypoint.sh

RUN chmod -R 777 /tmp /.hasura /hasura-migrations /hasura-metadata /tmp/plugins-downloads/cli-ext

ENTRYPOINT ["docker-entrypoint.sh"]

CMD graphql-engine \
    --database-url $DATABASE_URL \
    serve \
    --server-port $PORT
