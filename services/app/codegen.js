module.exports = {
  schema: {
    [process.env.REACT_APP_BESPOKE_GRAPHQL_ENDPOINT]: {
      headers: {
        "X-Hasura-Admin-Secret":
          process.env.REACT_APP_BESPOKE_HASURA_ADMIN_SECRET,
      },
    },
  },
  documents: ["./src/**/*.graphql"],
  overwrite: true,
  generates: {
    "./src/generated/graphql.tsx": {
      plugins: [
        "typescript",
        "typescript-operations",
        "typescript-react-apollo",
      ],
      config: {
        noNamespaces: true,
        skipTypename: true,
        withHooks: true,
        withHOC: false,
        withComponent: false,
        transformUnderscore: true,
        namingConvention: {
          typeNames: "change-case#pascalCase",
          transformUnderscore: true,
        },
      },
    },
    "./src/generated/graphql.schema.json": {
      plugins: ["introspection"],
    },
  },
};
