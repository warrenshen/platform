# Installing

1. Install NVM:
https://github.com/nvm-sh/nvm#installing-and-updating

2. Install Node:
```
nvm install v15.10.0
```

3. Activate Node environment and install dependencies:
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

Note: a running instance of [graphql-server](https://github.com/bespoke-capital/graphql-server) is a prerequisite.

# FAQ

1. List of iconography:
    * https://tablericons.com/
