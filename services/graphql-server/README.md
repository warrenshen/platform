## Installing

1. Install Docker

   Download and install [Docker](https://docs.docker.com/docker-for-mac/install/) via Docker for Mac; modify instructions for other OS accordingly. Further documentation can be found [here](https://docs.docker.com/engine/docker-overview/).

2. Install Hasura CLI

   [Hasura](https://hasura.io/) is a GraphQL server that gives you instant, realtime GraphQL APIs over Postgres, with webhook triggers on database events, and remote schemas for business logic.

   ```bash
   curl -L https://github.com/hasura/graphql-engine/raw/stable/cli/get.sh | bash
   ```

   See more detailed instructions [here](https://hasura.io/docs/1.0/graphql/manual/hasura-cli/install-hasura-cli.html)

## Running w/ Docker

The local environment is configured with [Docker Compose](https://docs.docker.com/compose/).

Run the application with:

```bash
docker-compose up
```

By default, `docker-compose up` will run any new migrations. You may encounter a situation where you do not want this behavior. If so, do the following:

1. Remove the config `- ./migrations:/hasura-migrations` from `volumes:` in `docker-compose.yaml`. Do not remove `- ./metadata:/hasura-metadata`. This will leave you with:

```
    volumes:
      - ./metadata:/hasura-metadata
```

2. Run the following:

```bash
docker-compose up
```

## Seed

```
hasura seeds apply --admin-secret=myadminsecretkey
```

This will provide some initial users, companies, etc. All users have password: `password123`

## Migrations

Open Hasura console on [`localhost:9695`](http://localhost:9695/) to track migrations (run the hasura console command first):

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

## FAQ

### Reset my local DB?

Stop your docker containers, then:

```bash
docker-compose down --volumes
docker-compose up
```

### Connect to my local DB w/psql?

Install [psql](https://www.postgresql.org/docs/9.3/app-psql.html) or [Postico](https://eggerapps.at/postico/), or your favorite postgres client.

```bash
psql postgres://postgres:postgrespassword@localhost:5432/postgres
```