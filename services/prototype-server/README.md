## Installing

1. Install Docker

   Download and install [Docker](https://docs.docker.com/docker-for-mac/install/) via Docker for Mac; modify instructions for other OS accordingly. Further documentation can be found [here](https://docs.docker.com/engine/docker-overview/).

2. Install Hasura CLI

   [Hasura](https://hasura.io/) is a GraphQL server that gives you instant, realtime GraphQL APIs over Postgres, with webhook triggers on database events, and remote schemas for business logic.

   ```bash
   curl -L https://github.com/hasura/graphql-engine/raw/stable/cli/get.sh | bash
   ```

   See more detailed instructions [here](https://hasura.io/docs/1.0/graphql/manual/hasura-cli/install-hasura-cli.html)

## Running w/Docker

The local environment is configured with [Docker Compose](https://docs.docker.com/compose/).

Running the application with:

```bash
docker-compose up
```

## Migrations

Open Hasura console on [`localhost:9695`](http://localhost:9695/) to track migrations:

```bash
hasura console --admin-secret=myadminsecretkey
```

Migrations and metadata will automatically apply on start up. But to revert or apply migrations manually,

```bash
hasura migrate apply --admin-secret=myadminsecretkey
hasura metadata apply --admin-secret=myadminsecretkey
```

## GraphQL Code Generation

Repeatedly generate GraphQL Apollo React hooks:

```bash
cd ../app
yarn gql-gen --watch
```
