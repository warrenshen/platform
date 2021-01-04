# Installing

```
nvm use
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

You will need the [graphql-server](https://github.com/bespoke-capital/graphql-server) running!
