# Installing

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

Sometimes you will need to manually reapply migrations or cleanup dead migrations. This is especially true on an M1 Macbook. To determine if you need to do this, run `hasura migrate status --admin-secret=myadminsecretkey`.

In your migrate status results, check to see if you have `SOURCE STATUS` as Present and `DATABASE STATUS` as Not Present. If that is true and you can see the component of the migration in your console, then you should use the command below.

```bash
hasura migrate apply --version <number from hasura status> --type up --skip-execution --admin-secret=myadminsecretkey
```

 If you made a change in hasura console but then backed it out (e.g. add a column, delete a column) it may leave a migration entry with `NAME` of "-" and a `SOURCE STATUS` as Not Present and `DATABASE STATUS` as Present. In that case, run the following steps:

```bash
mkdir <root>/services/graphql-server/migrations/<number from hasura status>_dummy
# in that directory make a down.sql file with a dummy query, e.g. "select * from users limit 1;"
hasura migrate apply --version 1644519103585 --type down --skip-execution --admin-secret=myadminsecretkey
```

## GraphQL Code Generation

Repeatedly generate GraphQL Apollo React hooks:

```bash
cd ../app
yarn gql-gen --watch
```

## FAQ

### Reset my local database?

Stop your docker containers, then:

```bash
docker-compose down --volumes
docker-compose up
```

### Connect to my local database w/ psql?

Install [psql](https://www.postgresql.org/docs/9.3/app-psql.html) or [Postico](https://eggerapps.at/postico/), or your favorite postgres client.

```bash
psql postgres://postgres:postgrespassword@localhost:5432/postgres
```

### Apply migrations to local database from inside Hasura container?

```bash
docker-compose exec bespoke-graphql-engine sh /bin/apply-migrations.sh
```

### Common SQL statements to run in the Hasura console?

1. View existing database table indices:
```sql
SELECT
  tablename,
  indexname,
  indexdef
FROM
  pg_indexes
WHERE
  schemaname = 'public'
ORDER BY
  tablename,
  indexname
;
```

2. Explain SQL query:
```sql
EXPLAIN
SELECT
  metrc_transfers.id
FROM
  metrc_transfers
  INNER JOIN metrc_deliveries ON metrc_transfers.id = metrc_deliveries.transfer_row_id
  INNER JOIN metrc_packages ON metrc_deliveries.id = metrc_packages.delivery_row_id
ORDER BY
  metrc_transfers.created_at
;
```

3. Insert table index:
```sql
CREATE INDEX IF NOT EXISTS metrc_transfers_company_id_transfer_type_key ON metrc_transfers (company_id, transfer_type);
```
