import { ApolloServer } from 'apollo-server';
import { resolvers } from './graphql/resolvers.js';
import typeDefs from './graphql/schemaTypes.js';
import { Neo4jGraphQL } from '@neo4j/graphql';
import neo4j from 'neo4j-driver';
import dotenv from 'dotenv';

dotenv.config();

const driver = neo4j.driver(
  'bolt://localhost:7687',
  neo4j.auth.basic('neo4j', '12345678')
);

const neoSchema = new Neo4jGraphQL({
  typeDefs,
  resolvers,
  driver,
  debug: true,
  features: {
    authorization: {
      key: {
        url: 'https://7accf451-0fe6-4a52-bf51-a5109cab406a.hanko.io/.well-known/jwks.json',
      },
    },
    // authorization: {
    //   key: process.env.JWT_SECRET || '',
    // },
  },
});

neoSchema
  .getSchema()
  .then((schema) => {
    const server = new ApolloServer({
      schema,
      // context: ({ req }) => ({ req }),
      context: ({ req }) => ({
        token: req.headers.authorization,
      }),
    });
    server.listen().then(({ url }) => {
      console.log('Server run at ', url);
    });

    if (!process.env.JWT_SECRET) {
      throw new Error('Не задан ключ для токенов авторизации.');
    }
  })
  .catch((err: any) => {
    console.log('Ошибка ', err);
  });

// const server = new ApolloServer({
//   typeDefs,
//   resolvers,
//   context: { db },
// });

// server.listen().then(({ url }) => {
//   console.log('Server run at ', url);
// });
