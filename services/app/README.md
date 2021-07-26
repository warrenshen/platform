# Installing

```
nvm use
cp .env.example .env
yarn install --frozen-lockfile
```

# Running

From this directory, to start up hot-reloading React app on port 3005...

```
yarn start
```

From this directory, to start up GraphQL code generation, which watches for any changes to .graphql files...

```
yarn gql-gen --watch
```

Note: a running instance of [graphql-server](https://github.com/bespoke-capital/graphql-server) is a prerequiste.

# Contributing

Before you push new changes, from this directory...

Run cypress (once cypress is open, press "Run integration spec(s)")...

```
yarn cypress
```

Note: running instances of [api-server](https://github.com/bespoke-capital/platform/tree/master/services/api-server#readme) and [graphql-server](https://github.com/bespoke-capital/graphql-server) are prerequistes.

# FAQ

1. List of iconography:
    * https://tablericons.com/
