# Bespoke Financial's Platform

Bespoke is built with [Material UI](https://material-ui.com/), [Typescript](https://www.typescriptlang.org/), [React](https://reactjs.org/), [Apollo GraphQL](https://www.apollographql.com/), [Hasura](https://hasura.io/), [Postgres](https://www.postgresql.org/), [Flask](https://flask.palletsprojects.com/en/1.1.x/), and [Python](https://www.python.org/).

Tested with [Cypress](https://www.cypress.io/).

CI/CD via [Github Actions](https://github.com/features/actions). Hosted on [Heroku](https://heroku.com/).

This monorepo includes

- Flask/Python API server
- Hasura/GraphQL API server
- React/Typescript static app

## Installing

1. Clone the repos

```
git clone git@github.com:bespoke-capital/platform.git
```

2. Install [Homebrew](https://brew.sh/), and:

```bash
brew update
brew upgrade
brew bundle
```

Installation of some dependencies may fail if on Big Sur (OS X 11.0.1). Re-installing command line tools may help:

```
sudo rm -rf /Library/Developer/CommandLineTools
sudo xcode-select --install
```

3. Adjust shell resource file

Please refer to `reference.zshrc` in the root of this project for changes you will need for your own `~/.zshrc` file. This file was originally created for local development on an M1 Macbook.

4. Follow instructions [here](https://docs.google.com/document/d/1fIoWutW-oksJabg2mDH3E7Ot4Vc1XMavUblGC0D0F-4/edit)

## Running

Follow instructions [here](https://docs.google.com/document/d/1fIoWutW-oksJabg2mDH3E7Ot4Vc1XMavUblGC0D0F-4/edit#heading=h.ouot35nvjvpl)

## Testing

Note: please configure your Docker service to have AT LEAST 4GB of memory.

From the `services` directory, to start up hot-reloading services to be used by Cypress integration tests...

```
docker-compose -f docker-compose.cypress.yaml -p cypress up
```

From the `services/app` directory, to start up the Cypress service...

```
yarn cypress
```
